export default class Peer extends RTCPeerConnection {
    public chat: RTCDataChannel;
    public movement: RTCDataChannel;
    public worldMapInfoHash: RTCDataChannel;
    public userImgInfoHash: RTCDataChannel;

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
        this.worldMapInfoHash = this.createDataChannel('world-map-infohash', {negotiated: true, id: 2});
        this.userImgInfoHash = this.createDataChannel('user-img-infohash', {negotiated: true, id: 3});
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

    public sendWorldMapInfoHash(infoHash: string) {
        const {worldMapInfoHash} = this;
        if (worldMapInfoHash.readyState !== 'open') return;
        worldMapInfoHash.send(infoHash);
    }

    public sendUserImgInfoHash(infoHash: string) {
        const {userImgInfoHash} = this;
        if (userImgInfoHash.readyState !== 'open') return;
        userImgInfoHash.send(infoHash);
    }

    public close() {
        const {chat, movement} = this
        chat.close();
        movement.close();
        super.close();
    }
}

export type Peers = Map<string, Peer>;
