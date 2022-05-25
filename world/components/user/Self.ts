import { PerspectiveCamera } from "three";
import { UserData } from "./User";
import Peer, { Peers } from "../../../connection/Peer";
import Controls from "../../../controls/Controls";
import World from "../../index";
import Collider from "../../physics/Collider";
import Gravity from "../../physics/Gravity";

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
}

export default class Self implements SelfInterface {
    data: UserData;
    state: SelfState;
    collision: CollisionRange;

    peers: Peers;
    controls: Controls;
    camera: PerspectiveCamera;
    collider: Collider;
    gravity: Gravity;

    constructor(world: World) {
        this.data = {
            userId: "",
            name: "",
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
        this.peers = new Map<string, Peer>();
        this.controls = undefined;
        this.camera = new PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 256);
        this.collider = new Collider(this, world.map);
        this.gravity = new Gravity(this.state);
    }

    public update(delta: number) {
        const { controls } = this;
        if (controls === undefined) {
            console.error('Please use setControls() to define controls');
            return;
        }
        const { camera, gravity, collider } = this;
        const pos = this.state.pos;
        Promise.all([
            controls.update(delta),
            gravity.update(delta),
            collider.update(delta),
        ]).then(() => camera.position.set(pos[0], pos[1] + 13, pos[2]));
    }
}
