import '../elements/chatzip-renderer';
import engine from '..';
import User from '../world/components/user/User';
import wtClient, { getMagnetLink } from '../connection/WTClient';

import PERSON_IMG from '../world/components/user/model/person.png';
import { Torrent } from 'webtorrent';

let newConnectionUserId: string | undefined = undefined;
const world = engine.world;

function createUserObject(): User {
    const id = Math.random().toString(36).substring(2,6);
    const user = new User(world.self.camera, id, id, PERSON_IMG);
    return user;
}

function onWorldLoaded() {
    const spawnPoint = engine.world.spawnPoint;
    const selfPos = engine.world.self.state.pos;
    selfPos[0] = spawnPoint[0] ? spawnPoint[0] : 0;
    selfPos[1] = spawnPoint[1] ? spawnPoint[1] : 0;
    selfPos[2] = spawnPoint[2] ? spawnPoint[2] : 0;
}

window.onload = () => {
    const logDiv = document.getElementById('log') as HTMLDivElement;

    function log(msg: string) {
        const logMsg = document.createElement('div');
        logMsg.innerText = msg;
        logDiv.appendChild(logMsg);
    }

    async function onWorldMapInfoHash(e: MessageEvent<string>) {
        if (engine.world.infoHash === e.data) return;
        engine.world.infoHash = e.data;
        log(`Received world infohash (${e.data})`);
        wtClient.get(e.data).then(async (t: Torrent) => {
            if (t) {
                const blob = await t.files[0].blob();
                engine.world.load(blob).then(onWorldLoaded);
                return;
            }
            wtClient.add(getMagnetLink(e.data), async (torrent) => {
                const blob = await torrent.files[0].blob();
                engine.world.load(blob).then(onWorldLoaded);
            });
        });
    }

    document.getElementById('btn-editor-on')!.onclick = () => {
        engine.enableEditor(true);
        log('Enabled editor mode.');
    }
    document.getElementById('btn-editor-off')!.onclick = () => {
        engine.enableEditor(false);
        log('Disabled editor mode.');
    }
    document.getElementById('btn-sync-world')!.onclick = () => {
        if (!world.infoHash) return;
        world.self.peers.forEach((user) => {
            user.worldMapInfoHash.send(world.infoHash as string);
            log(`Sended peer (${world.infoHash})`);
        });
    }
    document.getElementById('input-user-img')!.oninput = (e) => {
        const file = e.target.files?.[0];
        wtClient.seed(file, (torrent) => {
            world.self.peers.forEach((user) => {
                user.userImgInfoHash.send(torrent.infoHash);
                log(`Sended peer (${torrent.infoHash})`);
            });
        });
    }

    document.getElementById('btn-create-offer')!.onclick = () => {
        const user = createUserObject();
        newConnectionUserId = user.userId;
        user.conn.createSessionDescription('offer').then(sessionDescription => {
            console.log(JSON.stringify(sessionDescription));
            log("Created offer: " + JSON.stringify(sessionDescription));
        });
        world.users.set(user.userId, user);
    }
    const inputAnswerDesc = document.getElementById('input-answer-desc') as HTMLInputElement;
    document.getElementById('btn-answer-desc')!.onclick = () => {
        if (!newConnectionUserId) return;

        const user = world.users.get(newConnectionUserId);
        if (!user) return;

        user.conn.setRemoteDescription(JSON.parse(inputAnswerDesc.value));

        world.self.peers.set(newConnectionUserId, user.conn);

        user.conn.movement.onopen = () => {
            newConnectionUserId = undefined;
            log(`Connected with (${user.userId})`);
            world.add(user);

            const posBuffer = new ArrayBuffer(12);
            const posArr = new Float32Array(posBuffer);
            posArr.set(world.self.state.pos);
            user.conn.sendMovement(posArr);
        }
        user.conn.worldMapInfoHash.onmessage = onWorldMapInfoHash;
    }

    const inputOfferDesc = document.getElementById('input-offer-desc') as HTMLInputElement;
    document.getElementById('btn-offer-desc')!.onclick = () => {
        const user = createUserObject();
        newConnectionUserId = user.userId;

        user.conn.setRemoteDescription(JSON.parse(inputOfferDesc.value));

        user.conn.createSessionDescription('answer').then(sessionDescription => {
            console.log(JSON.stringify(sessionDescription));
            log("Created answer: " + JSON.stringify(sessionDescription));
        });

        world.users.set(user.userId, user);
        world.self.peers.set(newConnectionUserId, user.conn);
        
        user.conn.movement.onopen = () => {
            newConnectionUserId = undefined;
            log(`Connected with (${user.userId})`);
            world.add(user);

            const posBuffer = new ArrayBuffer(12);
            const posArr = new Float32Array(posBuffer);
            posArr.set(world.self.state.pos);
            user.conn.sendMovement(posArr);
        }
        user.conn.worldMapInfoHash.onmessage = onWorldMapInfoHash;
    }
    
    engine.addEventListener('world-loaded', () => {
        const worldFile = engine.world.file
        const file = worldFile instanceof ArrayBuffer ? new File([new Blob([worldFile], {type: 'application/zip'})], 'world.zip') : worldFile instanceof Blob ? new File([worldFile], 'world.zip') : worldFile;
        if (!file) return;
        wtClient.seed(file, (torrent) => {
            engine.world.infoHash = torrent.infoHash;
            log(`World map magnet link: ${torrent.magnetURI}`);
        });
    });
}