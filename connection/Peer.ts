export type SignalData = {
    type: string,
    evTarget?: Peer,
    id?: string,
    targetId?: string,
    name?: string,
    imgInfoHash?: string,
    sessionDescription?: RTCSessionDescriptionInit
}

export default class Peer extends RTCPeerConnection {
    public chat: RTCDataChannel;
    public movement: RTCDataChannel;
    public infohash: RTCDataChannel;
    public signalling: RTCDataChannel;

    constructor() {
        const iceConfig = {
            iceServers : [
                {
                    urls: 'stun:stun1.l.google.com:19302'
                }
            ]
        };
        super(iceConfig);

        this.chat = this.createDataChannel('chat', {negotiated: true, id: 0});
        this.movement = this.createDataChannel('move', {negotiated: true, id: 1});
        this.movement.binaryType = 'arraybuffer';
        this.infohash = this.createDataChannel('infohash', {negotiated: true, id: 2});
        this.signalling = this.createDataChannel('signalling', {negotiated: true, id: 3});

        this.onconnectionstatechange = () => {
            switch (this.connectionState) {
                case "closed":
                    this.dispatchEvent(new CustomEvent('onclosed'));
                    return;
                case "connected":
                    this.dispatchEvent(new CustomEvent('onconnected'));
                    return;
                case "connecting":
                    this.dispatchEvent(new CustomEvent('onconnecting'));
                    return;
                case "disconnected":
                    this.dispatchEvent(new CustomEvent('ondisconnected'));
                    return;
                case "failed":
                    this.dispatchEvent(new CustomEvent('onfailed'));
                    return;
                case "new":
                    this.dispatchEvent(new CustomEvent('onnew'));
                    return;
            }
        }

        this.signalling.onmessage = (e) => {
            const data: SignalData = JSON.parse(e.data);
            switch (data.type) {
                case 'user-info':
                    this.dispatchEvent(new CustomEvent<SignalData>('user-info', { detail: {
                        evTarget: this,
                        type: 'user-info',
                        id: data.id,
                        name: data.name,
                        imgInfoHash: data.imgInfoHash,
                    }}));
                    return;
                case 'req-offer':
                    this.dispatchEvent(new CustomEvent<SignalData>('req-offer', { detail: {
                        evTarget: this,
                        type: 'req-offer',
                        targetId: data.targetId,
                    }}));
                    return;
                case 'req-answer':
                    this.dispatchEvent(new CustomEvent<SignalData>('req-answer', { detail: {
                        evTarget: this,
                        type: 'req-answer',
                        id: data.id,
                        targetId: data.targetId,
                        sessionDescription: data.sessionDescription,
                    }}));
                    return;
                case 'recv-answer':
                    this.dispatchEvent(new CustomEvent<SignalData>('recv-answer', { detail: {
                        type: 'recv-answer',
                        targetId: data.targetId,
                        sessionDescription: data.sessionDescription,
                    }}));
                    return;
            }
        }
    }

    public createSessionDescription(type: 'answer'|'offer') {
        return new Promise<RTCSessionDescription | null>(resolve => {
            this.onicegatheringstatechange = e => {
                if (this.iceGatheringState !== 'complete') return;
                resolve(this.localDescription);
            }
            switch (type) {
                case 'offer':
                    this.createOffer().then(offer => this.setLocalDescription(offer));
                    break;
                case 'answer':
                    this.createAnswer().then(answer => this.setLocalDescription(answer));
                    break;
            }
        });
    }

    public sendChat(data: string) {
        const {chat} = this;
        if (chat.readyState !== 'open') return
        chat.send(data);
    }

    public sendMovement(data: ArrayBuffer) {
        const {movement} = this;
        if (movement.readyState !== 'open') return;
        movement.send(data);
    }

    public sendInfoHash(infoHash: {type: string, infohash: string}) {
        const {infohash} = this;
        if (infohash.readyState !== 'open') return;
        infohash.send(JSON.stringify(infoHash));
    }

    public sendSignalData(signalData: SignalData) {
        const {signalling} = this;
        if (signalling.readyState !== 'open') return;
        signalling.send(JSON.stringify(signalData));
    }

    public close() {
        const {chat, movement, infohash, signalling} = this
        chat.close();
        movement.close();
        infohash.close();
        signalling.close();
        super.close();
    }
}

export type Peers = Map<string, Peer>;
