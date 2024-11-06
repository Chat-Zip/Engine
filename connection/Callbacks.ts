import { Torrent } from "webtorrent";
import engine from "..";
import wtClient, { getMagnetLink } from "./WTClient";
import Peer, { SignalData } from "./Peer";
import User from "../world/components/user/User";
import PERSON_IMG from '../world/components/user/model/person.png';

const world = engine.world;
const peers = world.self.peers;
const selfData = world.self.data;
export const newPeerQueue: Peer[] = [];

function onWorldLoaded() {
    const spawnPoint = world.spawnPoint;
    const selfPos = world.self.state.pos;
    selfPos[0] = spawnPoint[0] ? spawnPoint[0] : 0;
    selfPos[1] = spawnPoint[1] ? spawnPoint[1] : 0;
    selfPos[2] = spawnPoint[2] ? spawnPoint[2] : 0;
}

export async function onWorldMapInfoHash(e: MessageEvent<string>) {
    const data = JSON.parse(e.data);
    if (data.type !== 'world') return;
    if (world.infoHash === data.infohash) return;
    world.infoHash = data.infohash;
    wtClient.get(data.infohash).then(async (t: Torrent) => {
        if (t) {
            const blob = await t.files[0].blob();
            world.load(blob).then(onWorldLoaded);
            return;
        }
        wtClient.add(getMagnetLink(data.infohash), async (torrent) => {
            const blob = await torrent.files[0].blob();
            world.load(blob).then(onWorldLoaded);
        });
    });
}

export async function onReceiveWorldMapInfoHash(e: MessageEvent<string>) {
    const data = JSON.parse(e.data);

    if (data.type !== 'world') return;
    if (world.infoHash === data.infohash) return;
    world.infoHash = data.infohash;
    wtClient.get(data.infohash).then(async (t: Torrent) => {
        if (t) {
            const blob = await t.files[0].blob();
            world.load(blob).then(onWorldLoaded);
            return;
        }
        wtClient.add(getMagnetLink(data.infohash), async (torrent) => {
            const blob = await torrent.files[0].blob();
            world.load(blob).then(onWorldLoaded);
        });
    });
}

export function applyPeerEventListeners(peer: Peer, options?: { reqGroupInfo: boolean }) {
    peer.addEventListener('user-info', onReceiveUserInfo);
    peer.addEventListener('req-offer', onReceiveReqOffer);
    peer.addEventListener('req-answer', onReceiveReqAnswer);
    peer.addEventListener('recv-answer', onReceiveRecvAnswer);
    peer.addEventListener('onconnected', () => {
        const selfData = world.self.data;
        if (!selfData.userId) selfData.userId = Math.random().toString(36).substring(2, 6);
        if (!selfData.name) selfData.name = selfData.userId;
        peer.signalling.onopen = () => peer.sendSignalData({
            type: 'user-info',
            s: selfData.userId,
            n: selfData.name,
            img: selfData.avatar,
            rgi: options?.reqGroupInfo
        });
        peer.infohash.onopen = () => {
            if (peer.localDescription?.type !== "offer" || !world.infoHash) return;
            peer.sendInfoHash({ type: 'world', infohash: world.infoHash });
        }
    });
    peer.infohash.addEventListener('message', onWorldMapInfoHash);
}

export function onReceiveUserInfo(e: CustomEventInit<SignalData>) {
    const data = e.detail!;
    const peer = e.detail!.p!;

    if (peers.has(data.s!)) return;
    
    // console.log(`(1)==========CONNECTED USER ID (${data.sID})==========`);
    // console.log(data);

    const user = new User(world.self.camera, data.s!, data.n!, PERSON_IMG, peer);
    peers.set(user.userId, peer);
    world.users.set(user.userId, user);

    const posBuffer = new ArrayBuffer(12);
    const posArr = new Float32Array(posBuffer);
    posArr.set(world.self.state.pos);

    peer.sendMovement(posArr);
    if (selfData.avatar) peer.sendInfoHash({ type: 'user-img', infohash: selfData.avatar });
    world.add(user);

    peer.addEventListener('ondisconnected', () => {
        world.users.delete(user.userId);
        peers.delete(user.userId);
        user.conn.close();
        user.dispose();
        world.remove(user);
    });

    if (peer.localDescription?.type === "answer" && data.rgi) {
        peer.sendSignalData({
            type: 'req-offer',
            s: selfData.userId,
            ga: selfData.userId,
            trsm: true
        });
        // console.log(`(2)==========REQ OFFER FROM (${selfData.userId})==========`);
        // console.log(data);
        peers.forEach((p, userId) => {
            if (userId === data.s) return;
            peer.sendSignalData({
                type: 'req-offer',
                s: userId,
                ga: selfData.userId,
                trsm: true
            });
            // console.log(`(2)==========REQ OFFER FROM (${userId})==========`);
            // console.log(data);
        });
    }
}

export function onReceiveReqOffer(e: CustomEventInit<SignalData>) {
    const data = e.detail!;
    const peer = e.detail!.p!;

    // if (data.sID === selfData.userId) return;
    if (!peers.has(data.s!)) {
        const newPeerOffer = new Peer();
        newPeerOffer.createSessionDescription('offer').then(offer => {
            peer.sendSignalData({ 
                type: 'req-answer',
                s: selfData.userId,
                r: data.s,
                // If receive transmission(true) from gruopAnswerID => (selfData.userId) is (groupOfferID)
                go: data.trsm ? selfData.userId : data.go,
                ga: data.ga,
                sd: offer!,
            });
            // console.log(`(3-1)==========CREATE OFFER FOR (${data.sID})==========`);
            // console.log(data);
        });
        newPeerQueue.push(newPeerOffer);

    }
    if (!data.trsm) return;
    peers.forEach((p, userId) => {
        if (userId === data.ga) return;
        p.sendSignalData({
            type: 'req-offer',
            s: data.s,
            go: selfData.userId,
            ga: data.ga,
            trsm: false
        });
        // console.log(`(3-2)==========TRANSFER REQ OFFER FROM (${data.sID}) TO (${userId})==========`);
        // console.log(data);
    });
}

export function onReceiveReqAnswer(e: CustomEventInit<SignalData>) {
    const data = e.detail!;
    const peer = e.detail!.p!;

    if (selfData.userId === data.go) {
        peers.get(data.ga!)?.sendSignalData(data);
        // console.log(`(4)==========TRANSFER REQ ANSWER FROM (${data.sID}) TO (${data.rID})==========`);
        // console.log(data);
        return;
    }

    if (selfData.userId === data.r) {
        const newPeerAnswer = new Peer();
        newPeerAnswer.setRemoteDescription(data.sd!);
        applyPeerEventListeners(newPeerAnswer);

        newPeerAnswer.createSessionDescription('answer').then(answer => {
            peer.sendSignalData({
                type: 'recv-answer',
                r: data.s,
                go: data.go,
                ga: data.ga,
                sd: answer!
            });
            // console.log(`(5-1)==========CREATE ANSWER FOR (${data.sID})==========`);
            // console.log(data);
        });
    }
    else {
        peers.get(data.r!)?.sendSignalData(data);
        // console.log(`(5-2)==========TRANSFER ANSWER FROM (${data.sID}) TO (${data.rID})==========`);
        // console.log(data);
    }
}

export function onReceiveRecvAnswer(e: CustomEventInit<SignalData>) {
    const data = e.detail!;

    if (selfData.userId === data.r) {
        // console.log(`(6)==========RECV ANSWER & CONNECTION READY!==========`);
        // console.log(data);
        const newPeerOffer = newPeerQueue.shift();
        if (!newPeerOffer) return;

        applyPeerEventListeners(newPeerOffer);
        newPeerOffer.setRemoteDescription(data.sd!);
    }
    else {
        if (selfData.userId === data.ga) {
            peers.get(data.go!)?.sendSignalData(data);
            // console.log(`(6)==========TRANSFER RECV ANSWER THROUGH groupOffer TO (${data.rID})==========`);
            // console.log(data);
            // console.log(`groupOffer ${data.groupOfferID} (${peers.has(data.groupOfferID!)}) ${peers.get(data.groupOfferID!)}`);
        }
        else {
            if (peers.has(data.r!)) {
                peers.get(data.r!)?.sendSignalData(data);
                // console.log(`(6)==========TRANSFER RECV ANSWER TO (${data.rID})==========`);
                // console.log(data);
            }
            else {
                console.error('Can\'t find receiver');
                // console.error(`(6)==========CANT FIND RECEIVER (${selfData.userId} ${data.rID}) (${selfData.userId === data.rID})==========`);
                // console.log(data);
            }
        }
    }
}