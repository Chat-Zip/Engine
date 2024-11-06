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

    const inputApiUrl = document.getElementById('input-api-url') as HTMLInputElement;
    function getRequestHeaders() {
        return {
            "Content-Type": "application/json",
        };
    }
    document.getElementById('btn-invitaion-create')!.onclick = async () => {
        const peer = new Peer();
        const invitationID = Math.random().toString(36).substring(2, 8);
        const sessionDescription = await peer.createSessionDescription('offer');
        log(`CREATED_INVITATION_CODE: (${invitationID})`);

        fetch(`${inputApiUrl.value.endsWith('/') ? inputApiUrl.value : `${inputApiUrl.value}/`}create-offer`, {
            mode: 'cors',
            headers: getRequestHeaders(),
            method: "POST",
            body: JSON.stringify({ id: invitationID, sd: sessionDescription })
        }).then(async (res) => {
            console.log(res);
            if (res.status !== 200) {
                res.text().then(text => log(text));
                return;
            }
            const sd = await res.json();
            peer.setRemoteDescription(sd);
            CONNECTION_CALLBACK.applyPeerEventListeners(peer, { reqGroupInfo: true });
        });
    }
    const inputInvitation = document.getElementById('input-invitation') as HTMLInputElement;
    document.getElementById('btn-invitaion-join')!.onclick = async () => {
        fetch(`${inputApiUrl.value.endsWith('/') ? inputApiUrl.value : `${inputApiUrl.value}/`}get-offer?id=${inputInvitation.value}`, {
            mode: 'cors',
            headers: getRequestHeaders(),
            method: 'GET'
        })
            .then(async (res) => {
                console.log(res);
                if (res.status !== 200) {
                    res.text().then(text => log(text));
                    return;
                }
                const offer = await res.json();
                const peer = new Peer();
                peer.setRemoteDescription(offer);
                CONNECTION_CALLBACK.applyPeerEventListeners(peer, { reqGroupInfo: true });

                const sessionDescription = await peer.createSessionDescription('answer');
                fetch(`${inputApiUrl.value.endsWith('/') ? inputApiUrl.value : `${inputApiUrl.value}/`}create-answer`, {
                    mode: 'cors',
                    headers: getRequestHeaders(),
                    method: "POST",
                    body: JSON.stringify({ id: inputInvitation.value, sd: sessionDescription })
                }).then(async (res) => {
                    console.log(res);
                    res.text().then(text => log(text));
                });
            })
    }
    document.getElementById('btn-invitaion-inactive')!.onclick = () => {
        fetch(`${inputApiUrl.value.endsWith('/') ? inputApiUrl.value : `${inputApiUrl.value}/`}delete-offer?id=${inputInvitation.value}`, {
            mode: 'cors',
            headers: getRequestHeaders(),
            method: 'GET'
        }).then(async (res) => {
            console.log(res);
            res.text().then(text => log(text));
        })
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
        CONNECTION_CALLBACK.applyPeerEventListeners(peer, { reqGroupInfo: true });
    }

    const inputOfferDesc = document.getElementById('input-offer-desc') as HTMLInputElement;
    document.getElementById('btn-offer-desc')!.onclick = () => {
        const peer = new Peer();
        peer.setRemoteDescription(JSON.parse(inputOfferDesc.value));
        peer.createSessionDescription('answer').then(sessionDescription => {
            log("Created answer: " + JSON.stringify(sessionDescription));
        });
        CONNECTION_CALLBACK.applyPeerEventListeners(peer, { reqGroupInfo: true });
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