"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const node_fetch_1 = __importStar(require("node-fetch"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
dotenv_flow_1.default.config();
class Twitch {
    constructor() {
        this.accessToken = '';
    }
    async init() {
        this.accessToken = await this.getAccessToken();
    }
    async getUser(name) {
        const users = await this.fetch('users', { login: name });
        return users[0];
    }
    getVods(userId, limit) {
        if (limit === undefined || limit < 1 || limit > 100) {
            limit = 20;
        }
        const videos = this.fetch('videos', { user_id: userId, type: 'archive', first: limit.toString() });
        return videos;
    }
    async fetch(path, searchParams) {
        const url = new url_1.URL(this.getUrl(path, searchParams));
        const headers = new node_fetch_1.Headers({ 'Client-ID': process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${this.accessToken}` });
        const res = await node_fetch_1.default(url, { headers });
        if (!res.ok) {
            throw new Error(`Error fetching from Twitch's API: ${res.statusText}.`);
        }
        const jsonRes = await res.json();
        return jsonRes.data;
    }
    getUrl(path, searchParams = {}) {
        const url = new url_1.URL(`https://api.twitch.tv/helix/${path}`);
        for (const [key, value] of Object.entries(searchParams)) {
            url.searchParams.set(key, value);
        }
        return url.toString();
    }
    async getAccessToken() {
        const url = new url_1.URL('https://id.twitch.tv/oauth2/token');
        url.searchParams.set('client_id', process.env.TWITCH_CLIENT_ID);
        url.searchParams.set('client_secret', process.env.TWITCH_CLIENT_SECRET);
        url.searchParams.set('grant_type', 'client_credentials');
        const res = await node_fetch_1.default(url, { method: 'POST' });
        if (!res.ok) {
            throw new Error(`Error while authenticating with Twitch's API: ${res.statusText}.`);
        }
        const jsonRes = await res.json();
        return jsonRes.access_token;
    }
}
exports.default = new Twitch();
