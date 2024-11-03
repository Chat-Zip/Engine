import '../elements/chatzip-renderer';
import engine from '..';
import Peer from '../connection/Peer';
import wtClient from '../connection/WTClient';
import * as CONNECTION_CALLBACK from '../connection/Callbacks';

const world = engine.world;

window.onload = () => {
    const logDiv = document.getElementById('log') as HTMLDivElement;

    function log(msg: string) {
        const logMsg = document.createElement('div');
        logMsg.innerText = msg;
        logDiv.appendChild(logMsg);
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
            user.sendInfoHash({ type: 'world', infohash: world.infoHash as string });
            log(`Sended peer (${world.infoHash})`);
        });
    }
    document.getElementById('input-user-img')!.oninput = (e) => {
        const file = e.target.files?.[0];
        wtClient.seed(file, (torrent) => {
            world.self.data.avatar = torrent.infoHash;
            world.self.peers.forEach((user) => {
                user.sendInfoHash({ type: 'user-img', infohash: torrent.infoHash });
                log(`Sended peer (${torrent.infoHash})`);
            });
        });
    }

    document.getElementById('btn-create-offer')!.onclick = () => {
        const peer = new Peer();
        CONNECTION_CALLBACK.newPeerQueue.push(peer);
        peer.createSessionDescription('offer').then(sessionDescription => {
            log("Created offer: " + JSON.stringify(sessionDescription));
        }); 
    }
    const inputAnswerDesc = document.getElementById('input-answer-desc') as HTMLInputElement;
    document.getElementById('btn-answer-desc')!.onclick = () => {
        const peer = CONNECTION_CALLBACK.newPeerQueue.shift();
        if (!peer) return;

        peer.setRemoteDescription(JSON.parse(inputAnswerDesc.value));

        peer.addEventListener('user-info', CONNECTION_CALLBACK.onReceiveUserInfo);
        peer.addEventListener('req-offer', CONNECTION_CALLBACK.onReceiveReqOffer);
        peer.addEventListener('req-answer', CONNECTION_CALLBACK.onReceiveReqAnswer);
        peer.addEventListener('recv-answer', CONNECTION_CALLBACK.onReceiveRecvAnswer);

        peer.addEventListener('onconnected', () => {
            const selfData = world.self.data;
            if (!selfData.userId) selfData.userId = Math.random().toString(36).substring(2, 6);
            if (!selfData.name) selfData.name = selfData.userId;
            peer.signalling.onopen = () => peer.sendSignalData({type: 'user-info', id: selfData.userId, name: selfData.name, imgInfoHash: selfData.avatar});
        });

        peer.infohash.addEventListener('message', CONNECTION_CALLBACK.onWorldMapInfoHash);
    }

    const inputOfferDesc = document.getElementById('input-offer-desc') as HTMLInputElement;
    document.getElementById('btn-offer-desc')!.onclick = () => {
        const peer = new Peer();

        peer.setRemoteDescription(JSON.parse(inputOfferDesc.value));

        peer.createSessionDescription('answer').then(sessionDescription => {
            log("Created answer: " + JSON.stringify(sessionDescription));
        });

        peer.addEventListener('user-info', CONNECTION_CALLBACK.onReceiveUserInfo);
        peer.addEventListener('req-offer', CONNECTION_CALLBACK.onReceiveReqOffer);
        peer.addEventListener('req-answer', CONNECTION_CALLBACK.onReceiveReqAnswer);
        peer.addEventListener('recv-answer', CONNECTION_CALLBACK.onReceiveRecvAnswer);

        peer.addEventListener('onconnected', () => {
            const selfData = world.self.data;
            if (!selfData.userId) selfData.userId = Math.random().toString(36).substring(2, 6);
            if (!selfData.name) selfData.name = selfData.userId;
            peer.signalling.onopen = () => peer.sendSignalData({type: 'user-info', id: selfData.userId, name: selfData.name, imgInfoHash: selfData.avatar});
        });

        peer.infohash.addEventListener('message', CONNECTION_CALLBACK.onWorldMapInfoHash);
    }

    engine.addEventListener('world-loaded', () => {
        const worldFile = engine.world.file
        const file = worldFile instanceof ArrayBuffer ? new File([new Blob([worldFile], { type: 'application/zip' })], 'world.zip') : worldFile instanceof Blob ? new File([worldFile], 'world.zip') : worldFile;
        if (!file) return;
        wtClient.seed(file, (torrent) => {
            engine.world.infoHash = torrent.infoHash;
            log(`World map magnet link: ${torrent.magnetURI}`);
        });
    });
}