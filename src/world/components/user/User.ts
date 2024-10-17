import { Vector3, Camera } from "three";
import UserModel from "./model";
import Peer from "../../../connection/Peer";

export interface UserData {
    userId: string | undefined;
    name: string | undefined;
    avatar: string | undefined;
}

export default class User extends UserModel implements UserData {
    private camera: Camera;
    private prevPos: Vector3;
    private targetPos: Vector3;
    private alpha: number;

    userId: string;
    name: string;
    avatar: string;
    conn: Peer;

    constructor(camera: Camera, id: string, name: string, avatar: string) {
        super(name, avatar);
        this.camera = camera;
        this.prevPos = new Vector3();
        this.targetPos = new Vector3();
        this.alpha = 0;

        this.userId = id;
        this.name = name;
        this.avatar = avatar;
        this.conn = new Peer();
        this.conn.movement.onmessage = e => this.updateMovement(e.data);
    }

    private updateMovement(buffer: ArrayBuffer) {
        const { prevPos, targetPos } = this;
        const mvArr = new Float32Array(buffer);
        prevPos.copy(targetPos);
        targetPos.fromArray(mvArr);
        this.alpha = 0;
    }

    public update(delta: number) {
        const camPos = this.camera.position;
        this.appearance.lookAt(camPos.x, this.position.y + 8, camPos.z);
        if (this.alpha == 1) return;
        this.alpha = this.alpha > 1 ? 1 : this.alpha + delta * 10;
        this.position.lerpVectors(this.prevPos, this.targetPos, this.alpha);
    }
}
