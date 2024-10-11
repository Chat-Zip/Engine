import { BoxGeometry, Intersection, Mesh, MeshBasicMaterial } from "three";
import World from ".";

const BLOCK_SIZE_BIT = 3;
const VH_GEOMETRY = new BoxGeometry(1.001, 1.001, 1.001);
const VH_MATERIAL = new MeshBasicMaterial({color: 0xffffff, opacity: 0.5, transparent: true});
const VOXEL_HELPER = new Mesh(VH_GEOMETRY, VH_MATERIAL);

export default class Editor {

    public isVoxel;
    public abortController;

    private world;
    private self;
    private meshs;
    private palette;

    public selectVoxel;
    public placeVoxel;
    public setBrush;
    private getRaycasterSelectedPos;

    constructor(world: World) {
        const scope = this;

        this.isVoxel = true;
        this.abortController = new AbortController();
        this.abortController.signal.onabort = () => this.world.remove(VOXEL_HELPER);

        this.world = world;
        this.self = world.self;
        this.meshs = world.map.meshs;
        this.palette = world.map.palette;

        this.getRaycasterSelectedPos = (intersect: Intersection) => {
            const { isVoxel, meshs } = scope;
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
                    const pos = selectPos.getComponent(idx);
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
        this.selectVoxel = () => {
            const { isVoxel, world, self, meshs } = scope;
            const intersect = self.getRaycasterIntersect(meshs.size ? Array.from(meshs.values()) : [world.map.gridHelper]);
            if (intersect) {
                const { selectPos, normal } = scope.getRaycasterSelectedPos(intersect);
                if (meshs.size === 0) 
                    VOXEL_HELPER.position.copy(selectPos.addScalar(isVoxel ? .5 : 4));
                else 
                    VOXEL_HELPER.position.copy(selectPos.addScalar(isVoxel ? .5 : 4).sub(normal!));
                world.add(VOXEL_HELPER);
                return;
            }
            world.remove(VOXEL_HELPER);
        }
        this.placeVoxel = () => {
            if (!document.pointerLockElement) return;
            const { isVoxel, self, meshs, world, palette } = scope;
            const paletteNum = palette.selected;
            const intersect = self.getRaycasterIntersect(meshs.size ? Array.from(meshs.values()) : [world.map.gridHelper]);
            if (intersect) {
                const { selectPos, normal } = scope.getRaycasterSelectedPos(intersect);
                if (palette.selected === -1 && meshs.size !== 0)
                    selectPos.sub(normal!);
                if (isVoxel) 
                    world.map.setVoxel(selectPos.x, selectPos.y, selectPos.z, paletteNum === -1 ? 0 : palette.list[paletteNum])
                else 
                    world.map.setBlock(selectPos.x, selectPos.y, selectPos.z, paletteNum === -1 ? 0 : palette.list[paletteNum])
                world.map.updateVoxelGeometry(selectPos.x, selectPos.y, selectPos.z);
            }
            this.selectVoxel();
        }
        this.setBrush = (mode: 'voxel' | 'block') => {
            switch(mode) {
                case 'voxel':
                    if (this.isVoxel) return;
                    this.isVoxel = true;
                    VH_GEOMETRY.scale(1/8, 1/8, 1/8);
                    break;
                case 'block':
                    if (!this.isVoxel) return;
                    this.isVoxel = false;
                    VH_GEOMETRY.scale(8, 8, 8);
                    break;
            }
        }
    }

    public initAbortController() {
        this.abortController = new AbortController();
        this.abortController.signal.onabort = () => this.world.remove(VOXEL_HELPER);
    }
}