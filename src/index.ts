import assert from 'assert';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import program from 'commander';
import downloadsFolder from 'downloads-folder';

import Streamlink from './Streamlink';
import Twitch, { TwitchVod } from './Twitch';
import Spinner from './Spinner';
import Utils from './Utils'; 

async function init(downloadPath: string) {
    
    Spinner.update('Starting ttvd');
    
    await Twitch.init();
    await Streamlink.streamlinkExists();
    
    const downloadPathExists = await fs.pathExists(downloadPath);
    
    if(downloadPathExists) {
        process.env.DOWNLOAD_PATH = downloadPath;
    }
    else {
        process.env.DOWNLOAD_PATH = downloadsFolder();
    }

    assert(process.env.TWITCH_CLIENT_ID, 'Twitch Client ID undefined.');
    assert(process.env.TWITCH_CLIENT_SECRET, 'Twitch Secret undefined.');
    
    Spinner.succeed();
}

async function getTwitchUserId(channel: string) {
    
    Spinner.update('Getting channel information');
    
    const user = await Twitch.getUser(channel);
    assert(user, `Twitch channel: '${channel}' not found.`);
    
    Spinner.succeed();
    
    return user.id;
}

async function getTwitchVods(userId: string, limit?: number) {
    
    Spinner.update('Getting VODs list');
    
    const videos = await Twitch.getVods(userId, limit);
    assert(videos.length > 0, 'No VODs to date.');
    
    Spinner.succeed();
    
    return videos;
}

async function downloadTwitchVod(video: TwitchVod, quality: string) {
        
    Spinner.update(`Downloading VOD: ${video.user_name}-${video.id}`);
    
    await Streamlink.downloadFile(`https://www.twitch.tv/videos/${video.id}`, `${video.user_name}-${video.id}.mp4`, quality).then(
        elapsedTime => {
            let hours = elapsedTime as number / 1000 / 60 / 60;
            let minutes = hours % 1 * 60;
            let seconds = Math.round(minutes % 1 * 60);

            let time = hours >= 1 ? `${hours}h:` : '' + `${minutes.toFixed()}m:${seconds}s`; 

            Spinner.succeed(`VOD '${video.user_name}-${video.id}' downloaded in ${time}`)
        }
    );
}

async function main(channel: string, quality: string, limit: number, downloadPath: string) {
    
    try {
        
        await init(downloadPath);
        
        const userId = await getTwitchUserId(channel);
        const videos = await getTwitchVods(userId, limit);
        
        const videosByIds: Record<string, TwitchVod> = {};
        const choices = [];
        
        for (const video of videos) {
            videosByIds[video.id] = video;

            let items = choices.length + 1;

            let title = `${Utils.reduce(video.title, Math.round(video.title.length * 0.7))} - ${new Date(video.created_at).toLocaleDateString()}`;

            let enumeratedTitle: string;
            enumeratedTitle = items < 10 ? `0${items} | ${title}` : `${items} | ${title}`;
            
            choices.push({ 
                name: enumeratedTitle, 
                value: video.id
            });
        }
        
        const answers = await inquirer.prompt([{
            type: "checkbox",
            name: 'videos',
            message: 'Select VODs to download',
            pageSize: 10,
            choices
        }]);
        
        if (answers.videos.length == 0) {
            console.log('\nEmpty selection.');
            
            process.exit(0);
        }
        
        for (const videoId of answers.videos) {
            const video = videosByIds[videoId];
            
            await downloadTwitchVod(video, quality);
        }        
    } catch (error) {
        Spinner.fail('Failed process', error);
    }
}

program.command('ttvd <channel>')
.description('Downloads a Twitch VOD')
.option("-q, --quality <quality>", "VOD's video quality (160p, 320p, 480p, 720p, 720p60, 1080p, 1080p60, best)")
.option("-l, --limit <limit>", "Numbers of VODs to list")
.option("-p, --path <path>", "Output download path")
.action(function(channel, options){
    main(channel, options.quality, options.limit, options.path);
});

program.parse(process.argv);
