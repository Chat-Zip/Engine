import WebTorrent from "webtorrent";

const wtClient = new WebTorrent();

function getWTClient() {
    return wtClient;
}

export function getMagnetLink(infoHash: string) {
    return `magnet:?xt=urn:btih:${infoHash}&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.dev`
}

export default getWTClient();