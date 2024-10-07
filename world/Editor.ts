import { BoxGeometry, Intersection, Mesh, MeshBasicMaterial } from "three";
import World from ".";

const BLOCK_SIZE_BIT = 3;
const VH_GEOMETRY = new BoxGeometry(1.001, 1.001, 1.001);
const VH_MATERIAL = new MeshBasicMaterial({color: 0xffffff, opacity: 0.5, transparent: true});
const VOXEL_HELPER = new Mesh(VH_GEOMETRY, VH_MATERIAL);

export default class Editor {

    public isVoxel;

    private world;
    private self;
    private meshs;
    private palette;

    constructor(world: World) {
        this.isVoxel = true;
        this.world = world;
        this.self = world.self;
        this.meshs = world.map.meshs;
        this.palette = world.map.palette;
    }

    private getRaycasterSelectedPos(intersect: Intersection) {
        const { isVoxel, meshs } = this;
        const selectPos = intersect.point;
        if (meshs.size === 0) {
            if (isVoxel) selectPos.floor();
            else {
                // Remove decimal point regardless of sign (different with floor())
                selectPos.x = (selectPos.x >> BLOCK_SIZE_BIT) << BLOCK_SIZE_BIT;
                selectPos.y = (selectPos.y >> BLOCK_SIZE_BIT) << BLOCK_SIZE_BIT;
                selectPos.z = (selectPos.z >> BLOCK_SIZE_BIT) << BLOCK_SIZE_BIT;
            }
            return {selectPos};
        }

        const normal = intersect.face?.normal;
        Object.values(normal!).forEach((n, idx) => {
            if (n !== 0) {
                const pos = normal?.getComponent(idx);
                selectPos.setComponent(idx, Math.round(pos!));
                if (isVoxel) selectPos.floor();
                else {
                    selectPos.x = (selectPos.x >> BLOCK_SIZE_BIT) << BLOCK_SIZE_BIT;
                    selectPos.y = (selectPos.y >> BLOCK_SIZE_BIT) << BLOCK_SIZE_BIT;
                    selectPos.z = (selectPos.z >> BLOCK_SIZE_BIT) << BLOCK_SIZE_BIT;
                    normal?.setComponent(idx, n << BLOCK_SIZE_BIT);
                }
                if (n < 0) selectPos.add(normal!);
                return;
            }
        });
        return {selectPos, normal};
    }

    public selectVoxel() {
        const { isVoxel, world, self, meshs } = this;
        const intersect = self.getRaycasterIntersect(Array.from(meshs.values()));
        if (intersect) {
            const { selectPos, normal } = this.getRaycasterSelectedPos(intersect);
            if (meshs.size === 0) 
                VOXEL_HELPER.position.copy(selectPos.addScalar(isVoxel ? .5 : 4));
            else 
                VOXEL_HELPER.position.copy(selectPos.addScalar(isVoxel ? .5 : 4).sub(normal!));
            world.add(VOXEL_HELPER);
            return;
        }
        world.remove(VOXEL_HELPER);
    }

    public placeVoxel() {
        const { isVoxel, self, meshs, world, palette } = this;
        const paletteNum = palette.selected;
        const intersect = self.getRaycasterIntersect(Array.from(meshs.values()));
        if (intersect) {
            const { selectPos, normal } = this.getRaycasterSelectedPos(intersect);
            if (palette.selected === -1 && meshs.size !== 0)
                selectPos.sub(normal!);
            if (isVoxel) 
                world.map.setVoxel(selectPos.x, selectPos.y, selectPos.z, paletteNum === -1 ? 0 : palette.list[paletteNum])
            else 
                world.map.setBlock(selectPos.x, selectPos.y, selectPos.z, paletteNum === -1 ? 0 : palette.list[paletteNum])
            world.map.updateVoxelGeometry(selectPos.x, selectPos.y, selectPos.z);
        }
    }
}