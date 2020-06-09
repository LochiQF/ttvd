import childProcess, { spawn } from 'child_process';
import util from 'util';
import path from 'path';

const exec = util.promisify(childProcess.exec);

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
    
    public async streamlinkExists() {
        
        let os = process.platform;
        let shellCmd: string;

        switch(os) {
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
            throw new Error('Streamlink not found or not installed.')
        }
    }
    
    public async downloadFile(url: string, fileName: string, quality: string) {

        if(quality === undefined || !VIDEO_QUALITIES.includes(quality.toLowerCase())) {
            quality = '720p';
        }

        return new Promise((resolve, reject) => {
            const sanitizedFileName = fileName.replace(/\//g, '-');
            
            const streamlinkArgs = [
                '-o', path.join(process.env.DOWNLOAD_PATH, sanitizedFileName),
                '--url', url,
                '--default-stream', quality,
                '--hls-segment-threads', '3'
            ];

            const start = Date.now();

            const command = spawn('streamlink', streamlinkArgs);
         
            command.on('error', (error: Error) => {
                reject(error);
            });
            
            command.on('close', (code: number) => {
                if (code == 0) {
                    resolve(Date.now() - start);
                } else {
                    reject(new Error('Something went wrong while downloading, retry.'));
                }
            });
        });
    }
}

export default new Streamlink();