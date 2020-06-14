# Twitch TV VOD Downloader (TTVD)

CLI terminal tool for downloading VODs (Videos On Demand) from various Twitch channels.
Works in Windows, Unix and OSX.

# Installation

## Requirements

- [Streamlink](https://streamlink.github.io/), any installation from 1.0.0 upwards should work.

## Steps

1. Install the application:

```sh
npm i -g https://github.com/LochiQF/ttvd
```

2. Navigate to your `npm` global installation folder: (%USERPROFILE/AppData/Roaming/npm/node_modules).

3. Create a `.env` configuration file into the TTVD root folder (...node_modules/ttvd/.env) following this example:

```yaml
TWITCH_CLIENT_ID= mytwitchclientid
TWITCH_CLIENT_SECRET= mytwitchsecret
DOWNLOAD_PATH= (could be blank)
```

## Usage

```sh

ttvd list <channel> [options]

Options:
-q / --quality (160p, 320p, 480p, 720p, 720p60, 1080, 1080p, best) - defaults to 720p if left blank
-l / --limit  number - defaults to 20 if left blank
-p / --path downloadPath - defaults to your downloads folder if left blank

Example:
ttvd list gamesdonequick -q best -l 30 
```

* You can also look up the options directly in the terminal with:
```sh  
ttvd -h / --help
```

## License

Licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.