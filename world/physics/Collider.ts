import { Box3, Vector3 } from "three";
import Self, { SelfState } from "../components/user/Self";
import WorldMap from "../components/map";

const NO_COLLISION = 1;
const EPSILON = 0.001;

const _boxCenter = new Vector3();

export default class Collider {
    private state: SelfState;
    private pos: Array<number>;
    private map: WorldMap;

    public box: Box3;
    public size: Vector3;

    constructor(self: Self, worldMap: WorldMap) {
        this.state = self.state;
        this.pos = this.state.pos;
        this.map = worldMap;

        this.box = new Box3();
        const collision = self.collision;
        this.size = new Vector3(collision.width, collision.height, collision.depth);
    }

    public updateBox() {
        const { pos, box, size } = this;
        _boxCenter.set(pos[0], pos[0] + 7, pos[2]);
        box.setFromCenterAndSize(_boxCenter, size);
    }

    private sweptAABB(voxelX: number, voxelY: number, voxelZ: number) {
        const {state, box} = this;
        const normal = new Int8Array(3);
        const velocity = state.velocity;
        const xInvEntry = velocity[0] > 0 ? voxelX - box.max.x : (voxelX + 1) - box.min.x;
        const xInvExit = velocity[0] > 0 ? (voxelX + 1) - box.min.x : voxelX - box.max.x;
        const yInvEntry = velocity[1] > 0 ? voxelY - box.max.y : (voxelY + 1) - box.min.y;
        const yInvExit = velocity[1] > 0 ? (voxelY + 1) - box.min.y : voxelY - box.max.y;
        const zInvEntry = velocity[2] > 0 ? voxelZ - box.max.z : (voxelZ + 1) - box.min.z;
        const zInvExit = velocity[2] > 0 ? (voxelZ + 1) - box.min.z : voxelZ - box.max.z;
    
        const xEntry = velocity[0] === 0 ? -Infinity : xInvEntry / velocity[0];
        const xExit = velocity[0] === 0 ? Infinity : xInvExit / velocity[0];
        const yEntry = velocity[1] === 0 ? -Infinity : yInvEntry / velocity[1];
        const yExit = velocity[1] === 0 ? Infinity : yInvExit / velocity[1];
        const zEntry = velocity[2] === 0 ? -Infinity : zInvEntry / velocity[2];
        const zExit = velocity[2] === 0 ? Infinity : zInvExit / velocity[2];
    
        const entryTime = Math.max(xEntry, yEntry, zEntry);
        const exitTime = Math.min(xExit, yExit, zExit);
        //if no collision
        if (entryTime > exitTime || entryTime < 0) {
            return {NO_COLLISION, normal};
        }
        else {
            normal[0] = entryTime === xEntry ? -Math.sign(velocity[0]) : 0;
            normal[1] = entryTime === yEntry ? -Math.sign(velocity[1]) : 0;
            normal[2] = entryTime === zEntry ? -Math.sign(velocity[2]) : 0;
            return {entryTime, normal};
        }
    }
}
