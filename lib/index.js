"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const commander_1 = __importDefault(require("commander"));
const downloads_folder_1 = __importDefault(require("downloads-folder"));
const Streamlink_1 = __importDefault(require("./Streamlink"));
const Twitch_1 = __importDefault(require("./Twitch"));
const Spinner_1 = __importDefault(require("./Spinner"));
const Utils_1 = __importDefault(require("./Utils"));
async function init(downloadPath) {
    Spinner_1.default.update('Starting ttwd');
    await Twitch_1.default.init();
    await Streamlink_1.default.streamlinkExists();
    const downloadPathExists = await fs_extra_1.default.pathExists(downloadPath);
    if (downloadPathExists) {
        process.env.DOWNLOAD_PATH = downloadPath;
    }
    else {
        process.env.DOWNLOAD_PATH = downloads_folder_1.default();
    }
    assert_1.default(process.env.TWITCH_CLIENT_ID, 'Twitch Client ID undefined.');
    assert_1.default(process.env.TWITCH_CLIENT_SECRET, 'Twitch Secret undefined.');
    Spinner_1.default.succeed();
}
async function getTwitchUserId(channel) {
    Spinner_1.default.update('Getting channel information');
    const user = await Twitch_1.default.getUser(channel);
    assert_1.default(user, `Twitch channel: '${channel}' not found.`);
    Spinner_1.default.succeed();
    return user.id;
}
async function getTwitchVods(userId, limit) {
    Spinner_1.default.update('Getting vods list');
    const videos = await Twitch_1.default.getVods(userId, limit);
    assert_1.default(videos.length > 0, 'No vods to date.');
    Spinner_1.default.succeed();
    return videos;
}
async function downloadTwitchVod(video, quality) {
    Spinner_1.default.update(`Downloading VOD: ${video.user_name}-${video.id}`);
    await Streamlink_1.default.downloadFile(`https://www.twitch.tv/videos/${video.id}`, `${video.user_name}-${video.id}.mp4`, quality).then(elapsedTime => {
        let hours = elapsedTime / 1000 / 60 / 60;
        let minutes = hours % 1 * 60;
        let seconds = Math.round(minutes % 1 * 60);
        let time = hours >= 1 ? `${hours}h:` : '' + `${minutes.toFixed(0)}m:${seconds}s`;
        Spinner_1.default.succeed(`VOD '${video.user_name}-${video.id}' downloaded in ${time}`);
    });
}
async function main(channel, quality, limit, downloadPath) {
    try {
        /*
        TODO:
        - terminal pagination for vods so that a user can skip through videos and get to their desired one without inquirer glitches on updates
        - disable choices in the checkbox list if already downloaded
            -> prevents same name files and other issues
        */
        await init(downloadPath);
        const userId = await getTwitchUserId(channel);
        const videos = await getTwitchVods(userId, limit);
        const videosByIds = {};
        const choices = [];
        for (const video of videos) {
            videosByIds[video.id] = video;
            let items = choices.length + 1;
            let title = `${Utils_1.default.reduce(video.title, Math.round(video.title.length * 0.7))} - ${new Date(video.created_at).toLocaleDateString()}`;
            let enumeratedTitle;
            enumeratedTitle = items < 10 ? `0${items} | ${title}` : `${items} | ${title}`;
            choices.push({
                name: enumeratedTitle,
                value: video.id
            });
        }
        const answers = await inquirer_1.default.prompt([{
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
    }
    catch (error) {
        Spinner_1.default.fail('Failed process', error);
    }
}
commander_1.default.command('ttwd <channel>')
    .description('Downloads a Twitch VOD')
    .option("-q, --quality <quality>", "VOD's video quality (160p, 320p, 480p, 720p, 720p60, 1080p, 1080p60, best)")
    .option("-l, --limit <limit>", "Numbers of VODs to list")
    .option("-p, --path <path>", "Output download path")
    .action(function (channel, options) {
    main(channel, options.quality, options.limit, options.path);
});
commander_1.default.parse(process.argv);
