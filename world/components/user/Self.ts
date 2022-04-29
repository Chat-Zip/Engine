import { UserData } from "./User";
import { PerspectiveCamera } from "three";

export interface SelfState {
    pos: Array<number>;
    velocity: Array<number>;
    onGround: boolean;
    speed: number;
    jumpHeight: number;
    gravity: number;
    gravAccel: number;
}

export interface CollisionRange {
    width: number;
    height: number;
    depth: number;
}

export interface SelfInterface {
    data: UserData;
    state: SelfState;
    collision: CollisionRange;
    camera: PerspectiveCamera;
}

export default class Self implements SelfInterface {
    data: UserData;
    state: SelfState;
    collision: CollisionRange;
    camera: PerspectiveCamera;

    constructor(id: string, name: string) {
        this.data = {
            userId: id,
            name: name,
        };
        this.state = {
            pos: [0, 0, 0],
            velocity: [0, 0, 0],
            onGround: false,
            speed: 25,
            jumpHeight: 60,
            gravity: 200,
            gravAccel: 0,
        };
        this.collision = {
            width: 4,
            height: 14,
            depth: 4,
        };
        this.camera = new PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 256);
    }
}
