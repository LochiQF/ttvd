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
const child_process_1 = __importStar(require("child_process"));
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const exec = util_1.default.promisify(child_process_1.default.exec);
const VIDEO_QUALITIES = [
    //'audio',
    '160p',
    '320p',
    '480p',
    '720p',
    '720p60',
    '1080p',
    '1080p60',
    'best'
];
class Streamlink {
    async streamlinkExists() {
        let os = process.platform;
        let shellCmd;
        switch (os) {
            case 'win32':
                shellCmd = 'where';
                return;
            case 'darwin':
                shellCmd = 'which';
                return;
            default:
                shellCmd = 'whereis';
        }
        const { stdout } = await exec(`${shellCmd} streamlink`);
        if (!stdout.includes('streamlink')) {
            throw new Error('Streamlink not found or not installed.');
        }
    }
    async downloadFile(url, fileName, quality) {
        if (quality === undefined || !VIDEO_QUALITIES.includes(quality.toLowerCase())) {
            quality = '720p';
        }
        return new Promise((resolve, reject) => {
            const sanitizedFileName = fileName.replace(/\//g, '-');
            const streamlinkArgs = [
                '-o', path_1.default.join(process.env.DOWNLOAD_PATH, sanitizedFileName),
                '--url', url,
                '--default-stream', quality,
                '--hls-segment-threads', '3'
            ];
            const start = Date.now();
            const command = child_process_1.spawn('streamlink', streamlinkArgs);
            command.on('error', (error) => {
                reject(error);
            });
            command.on('close', (code) => {
                if (code == 0) {
                    resolve(Date.now() - start);
                }
                else {
                    reject(new Error('Something went wrong while downloading, retry.'));
                }
            });
        });
    }
}
exports.default = new Streamlink();
