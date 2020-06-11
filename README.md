# Twitch TV VOD Downloader (TTVD)

CLI terminal tool for downloading VODs (Videos On Demand) from various Twitch channels.
Works in Windows, Unix and OSX.

# Installation

## Requirements

- [Streamlink](https://streamlink.github.io/), any installation from 1.0.0 upwards should work.

1. Install the application:

```sh
npm i -g https://github.com/LochiQF/ttvd
```

2. Navigate to your `npm` global installation folder: (%USERPROFILE/AppData/Roaming/npm/node_modules).

3. Create a `.env` configuration file into the TTVD root folder (...node_modules/ttvd/.env) following this example:

```yaml
TWITCH_CLIENT_ID= mytwitchclientid
TWITCH_CLIENT_SECRET= mytwitchsecret
DOWNLOAD_PATH=(could be blank)
```

## Usage

```sh
ttvd list gamesdonequick -q best -l 30 
```

## License

Licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.