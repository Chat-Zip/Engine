import { Torrent } from "webtorrent";
import engine from "..";
import wtClient, { getMagnetLink } from "./WTClient";
import Peer, { SignalData } from "./Peer";
import User from "../world/components/user/User";
import PERSON_IMG from '../world/components/user/model/person.png';

const world = engine.world;
export const newPeerQueue: Peer[] = [];

function onWorldLoaded() {
    const spawnPoint = engine.world.spawnPoint;
    const selfPos = engine.world.self.state.pos;
    selfPos[0] = spawnPoint[0] ? spawnPoint[0] : 0;
    selfPos[1] = spawnPoint[1] ? spawnPoint[1] : 0;
    selfPos[2] = spawnPoint[2] ? spawnPoint[2] : 0;
}

export async function onWorldMapInfoHash(e: MessageEvent<string>) {
    const data = JSON.parse(e.data);
    if (data.type !== 'world') return;
    if (engine.world.infoHash === data.infohash) return;
    engine.world.infoHash = data.infohash;
    wtClient.get(data.infohash).then(async (t: Torrent) => {
        if (t) {
            const blob = await t.files[0].blob();
            engine.world.load(blob).then(onWorldLoaded);
            return;
        }
        wtClient.add(getMagnetLink(data.infohash), async (torrent) => {
            const blob = await torrent.files[0].blob();
            engine.world.load(blob).then(onWorldLoaded);
        });
    });
}

export async function onReceiveWorldMapInfoHash(e: MessageEvent<string>) {
    const data = JSON.parse(e.data);

    if (data.type !== 'world') return;
    if (engine.world.infoHash === data.infohash) return;
    engine.world.infoHash = data.infohash;
    wtClient.get(data.infohash).then(async (t: Torrent) => {
        if (t) {
            const blob = await t.files[0].blob();
            engine.world.load(blob).then(onWorldLoaded);
            return;
        }
        wtClient.add(getMagnetLink(data.infohash), async (torrent) => {
            const blob = await torrent.files[0].blob();
            engine.world.load(blob).then(onWorldLoaded);
        });
    });
}

export function onReceiveUserInfo(e: CustomEventInit<SignalData>) {
    const data = e.detail!;
    const peer = e.detail!.evTarget!;

    if (world.self.peers.has(data.id!)) return;
    console.log(`==========CONNECTED USER ID (${data.id})==========`);
    world.self.peers.forEach((p, userId) => {
        if (data.id === userId) return;
        p.sendSignalData({ type: 'req-offer', targetId: data.id });
    });

    const user = new User(world.self.camera, data.id!, data.name!, PERSON_IMG, peer);
    world.users.set(user.userId, user);
    world.self.peers.set(user.userId, peer);

    const posBuffer = new ArrayBuffer(12);
    const posArr = new Float32Array(posBuffer);
    posArr.set(world.self.state.pos);

    peer.sendMovement(posArr);
    if (world.self.data.avatar) peer.sendInfoHash({ type: 'user-img', infohash: world.self.data.avatar });
    world.add(user);

    peer.addEventListener('ondisconnected', () => {
        world.users.delete(user.userId);
        world.self.peers.delete(user.userId);
        user.conn.close();
        user.dispose();
        world.remove(user);
    });
}

export function onReceiveReqOffer(e: CustomEventInit<SignalData>) {
    const data = e.detail!;
    const peer = e.detail!.evTarget!;

    if (world.self.peers.has(data.targetId!)) return;
    const newPeerOffer = new Peer();
    newPeerOffer.createSessionDescription('offer').then(offer => {
        peer.sendSignalData({ type: 'req-answer', id: world.self.data.userId, targetId: data.targetId, sessionDescription: offer! });
    });
    newPeerQueue.push(newPeerOffer);
}

export function onReceiveReqAnswer(e: CustomEventInit<SignalData>) {
    const data = e.detail!;
    const peer = e.detail!.evTarget!;

    if (data.targetId === world.self.data.userId) {
        const newPeerAnswer = new Peer();
        newPeerAnswer.setRemoteDescription(data.sessionDescription!);

        newPeerAnswer.addEventListener('user-info', onReceiveUserInfo);
        newPeerAnswer.addEventListener('req-offer', onReceiveReqOffer);
        newPeerAnswer.addEventListener('req-answer', onReceiveReqAnswer);
        newPeerAnswer.addEventListener('recv-answer', onReceiveRecvAnswer);
        newPeerAnswer.addEventListener('onconnected', () => {
            const selfData = world.self.data;
            if (!selfData.userId) selfData.userId = Math.random().toString(36).substring(2, 6);
            if (!selfData.name) selfData.name = selfData.userId;
            newPeerAnswer.signalling.onopen = () => newPeerAnswer.sendSignalData({ type: 'user-info', id: selfData.userId, name: selfData.name, imgInfoHash: selfData.avatar });
        });
        newPeerAnswer.infohash.addEventListener('message', onWorldMapInfoHash);

        newPeerAnswer.createSessionDescription('answer').then(answer => {
            peer.sendSignalData({type: 'recv-answer', targetId: data.id, sessionDescription: answer!})
        });
    }
    else {
        world.self.peers.get(data.targetId!)?.sendSignalData({ type: 'req-answer', id: data.id, targetId: data.targetId, sessionDescription: data.sessionDescription });
    }
}

export function onReceiveRecvAnswer(e: CustomEventInit<SignalData>) {
    const data = e.detail!;

    if (data.targetId === world.self.data.userId) {
        const newPeerOffer = newPeerQueue.shift();
        if (!newPeerOffer) return;

        newPeerOffer.addEventListener('user-info', onReceiveUserInfo);
        newPeerOffer.addEventListener('req-offer', onReceiveReqOffer);
        newPeerOffer.addEventListener('req-answer', onReceiveReqAnswer);
        newPeerOffer.addEventListener('recv-answer', onReceiveRecvAnswer);
        newPeerOffer.addEventListener('onconnected', () => {
            const selfData = world.self.data;
            if (!selfData.userId) selfData.userId = Math.random().toString(36).substring(2, 6);
            if (!selfData.name) selfData.name = selfData.userId;
            newPeerOffer.signalling.onopen = () => newPeerOffer.sendSignalData({ type: 'user-info', id: selfData.userId, name: selfData.name, imgInfoHash: selfData.avatar });
        });
        newPeerOffer.infohash.addEventListener('message', onWorldMapInfoHash);

        newPeerOffer.setRemoteDescription(data.sessionDescription!);
    }
    else {
        world.self.peers.get(data.targetId!)?.sendSignalData({ type: 'recv-answer', targetId: data.targetId, sessionDescription: data.sessionDescription });
    }
}