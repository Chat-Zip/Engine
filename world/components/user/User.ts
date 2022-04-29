import { Vector3 } from "three";
import UserModel from "./model";

export interface UserData {
    userId: string;
    name: string;
}

export default class User extends UserModel implements UserData {
    private prevPos: Vector3;
    private targetPos: Vector3;
    private alpha: number;

    userId: string;
    name: string;

    constructor(id: string, name: string) {
        super(name);
        this.prevPos = new Vector3();
        this.targetPos = new Vector3();
        this.alpha = 0;

        this.userId = id;
        this.name = name;
    }

    public updateMovement(buffer: ArrayBuffer) {
        const { prevPos, targetPos } = this;
        const mvArr = new Float32Array(buffer);
        prevPos.copy(targetPos);
        targetPos.fromArray(mvArr);
        this.alpha = 0;
    }

    public update(delta: number) {
        if (this.alpha == 1) return;
        this.alpha = this.alpha > 1 ? 1 : this.alpha + delta * 10;
        this.position.lerpVectors(this.prevPos, this.targetPos, this.alpha);
    }
}
