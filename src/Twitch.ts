import { URL } from 'url';
import _fetch, { Headers } from 'node-fetch';
import dotenv from 'dotenv-flow';

dotenv.config();

type Api = string;
type SearchParameters = Record<string, string>;

export type TwitchUser = {
    id: string,
    login: string,
    display_name: string,
    type: string,
    broadcaster_type: string,
    description: string,
    profile_image_url: string,
    offline_image_url: string,
    view_count: number
};

export type TwitchVod = {
    id: string,
    user_id: string,
    user_name: string,
    title: string,
    description: string,
    created_at: string,
    published_at: string,
    url: string,
    pagination: string,
    thumbnail_url: string,
    viewable: string,
    view_count: number,
    language: string,
    type: string,
    duration: string
};

class Twitch {
     
    private accessToken = '';

    async init() {

        this.accessToken = await this.getAccessToken();
    }
    
    public async getUser(name: string): Promise<TwitchUser> {
        
        const users = await this.fetch('users', { login: name });
        
        return users[0];
    }
    
    public getVods(userId: string, limit?: number): Promise<TwitchVod[]> {
        
        if(limit === undefined || limit < 1 || limit > 100) {
            limit = 20;    
        }
        
        const videos = this.fetch('videos', { user_id: userId, type: 'archive', first: limit.toString() });
        
        return videos;
    }
    
    private async fetch(path: Api, searchParams?: SearchParameters) {
         
        const url = new URL(this.getUrl(path, searchParams));
        const headers = new Headers({ 'Client-ID': process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${this.accessToken}` });
        const res = await _fetch(url, { headers });
        
        if (!res.ok) {
            throw new Error(`Error fetching from Twitch's API: ${res.statusText}.`);
        }
        
        const jsonRes = await res.json();
        
        return jsonRes.data;
    }
    
    private getUrl(path: Api, searchParams: SearchParameters = {}) {
        
        const url = new URL(`https://api.twitch.tv/helix/${path}`);
        
        for (const [key, value] of Object.entries(searchParams)) {
            url.searchParams.set(key, value);
        }
        
        return url.toString();
    }
    
    private async getAccessToken() {
        
        const url = new URL('https://id.twitch.tv/oauth2/token');
        
        url.searchParams.set('client_id', process.env.TWITCH_CLIENT_ID);
        url.searchParams.set('client_secret', process.env.TWITCH_CLIENT_SECRET);
        url.searchParams.set('grant_type', 'client_credentials');
        
        const res = await _fetch(url, { method: 'POST' });
        
        if (!res.ok) {
            throw new Error(`Error while authenticating with Twitch's API: ${res.statusText}.`);
        }
        
        const jsonRes = await res.json();
        
        return jsonRes.access_token;
    }  
}

export default new Twitch();