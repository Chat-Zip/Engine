export default class Peer extends RTCPeerConnection {
    public chat: RTCDataChannel;
    public movement: RTCDataChannel;
    public infohash: RTCDataChannel;

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
    }

    public createSessionDescription(type: 'answer'|'offer') {
        return new Promise(resolve => {
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

    public sendInfoHash(infoHash: string) {
        const {infohash} = this;
        if (infohash.readyState !== 'open') return;
        infohash.send(infoHash);
    }

    public close() {
        const {chat, movement} = this
        chat.close();
        movement.close();
        super.close();
    }
}

export type Peers = Map<string, Peer>;
