import * as THREE from "three";
import Palette from "./Palette";

const CHUNK_SIZE = 32;
const CHUNK_SIZE_BIT = 5;
const CHUNK_SLICE_SIZE = 1024;
const CHUNK_SLICE_SIZE_BIT = 10;

const CONVERSION = 128;

const NEIGHBOR_OFFSETS = [
    [0, 0, 0], // self
    [-1, 0, 0], // left
    [1, 0, 0], // right
    [0, -1, 0], // bottom
    [0, 1, 0], // top
    [0, 0, -1], // back
    [0, 0, 1], // forward
];
const FACES = [
    { // left
        dir: NEIGHBOR_OFFSETS[1],
        corners: [
            [0, 1, 0],
            [0, 0, 0],
            [0, 1, 1],
            [0, 0, 1],
        ],
    },
    { // right
        dir: NEIGHBOR_OFFSETS[2],
        corners: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
    { // bottom
        dir: NEIGHBOR_OFFSETS[3],
        corners: [
            [1, 0, 1],
            [0, 0, 1],
            [1, 0, 0],
            [0, 0, 0],
        ],
    },
    { // top
        dir: NEIGHBOR_OFFSETS[4],
        corners: [
            [0, 1, 1],
            [1, 1, 1],
            [0, 1, 0],
            [1, 1, 0],
        ],
    },
    { // back
        dir: NEIGHBOR_OFFSETS[5],
        corners: [
            [1, 0, 0],
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 0],
        ],
    },
    { // forward
        dir: NEIGHBOR_OFFSETS[6],
        corners: [
            [0, 0, 1],
            [1, 0, 1],
            [0, 1, 1],
            [1, 1, 1],
        ],
    },
]

const _material = new THREE.MeshLambertMaterial({vertexColors: true});

interface MapData {
    paletteColors: Array<string>;
    spawnPoint: Array<number>;
}

export default class WorldMap {
    private scene: THREE.Scene;
    public chunks: Map<string, Uint8Array>;
    public meshs: Map<string, THREE.Mesh>;
    public data: MapData;
    public palette: Palette;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.meshs = new Map();
        this.data = {
            paletteColors: [
                "",
                "#060608",
                "#141013",
                "#3b1725",
                "#73172d",
                "#b4202a",
                "#df3e23",
                "#fa6a0a",
                "#f9a31b",
                "#ffd541",
                "#fffc40",
                "#d6f264",
                "#9cdb43",
                "#59c135",
                "#14a02e",
                "#1a7a3e",
                "#24523b",
                "#122020",
                "#143464",
                "#285cc4",
                "#249fde",
                "#20d6c7",
                "#a6fcdb",
                "#ffffff",
                "#fef3c0",
                "#fad6b8",
                "#f5a097",
                "#e86a73",
                "#bc4a9b",
                "#793a80",
                "#403353",
                "#242234",
                "#221c1a",
                "#322b28",
                "#71413b",
                "#bb7547",
                "#dba463",
                "#f4d29c",
                "#dae0ea",
                "#b3b9d1",
                "#8b93af",
                "#6d758d",
                "#4a5462",
                "#333941",
                "#422433",
                "#5b3138",
                "#8e5252",
                "#ba756a",
                "#e9b5a3",
                "#e3e6ff",
                "#b9bffb",
                "#849be4",
                "#588dbe",
                "#477d85",
                "#23674e",
                "#328464",
                "#5daf8d",
                "#92dcba",
                "#cdf7e2",
                "#e4d2aa",
                "#c7b08b",
                "#a08662",
                "#796755",
                "#5a4e44",
                "#423934"
            ],
            spawnPoint: [undefined, undefined, undefined],
        };
        this.palette = new Palette(this.data.paletteColors);
    }

    public computeChunkId(x: number, y: number, z: number) {
        return `${x >> CHUNK_SIZE_BIT},${y >> CHUNK_SIZE_BIT},${z >> CHUNK_SIZE_BIT}`;
    }

    public getChunkForVoxel(x: number, y: number, z: number) {
        return this.chunks.get(this.computeChunkId(x, y, z));
    }

    public addChunkForVoxel(x: number, y: number, z: number) {
        const chunkId = this.computeChunkId(x, y, z);
        let chunk = this.chunks.get(chunkId);
        if (chunk) return chunk;
        chunk = new Uint8Array(CHUNK_SLICE_SIZE << CHUNK_SIZE_BIT);
        this.chunks.set(chunkId, chunk);
        return chunk;
    }

    public computeVoxelOffset(x: number, y: number, z: number) {
        const vX = THREE.MathUtils.euclideanModulo(x, CHUNK_SIZE) | 0;
        const vY = THREE.MathUtils.euclideanModulo(y, CHUNK_SIZE) | 0;
        const vZ = THREE.MathUtils.euclideanModulo(z, CHUNK_SIZE) | 0;
        return (vY << CHUNK_SLICE_SIZE_BIT) + (vZ << CHUNK_SIZE_BIT) + vX;
    }

    public setVoxel(x: number, y: number, z: number, voxel: number) {
        let chunk = this.getChunkForVoxel(x, y, z);
        if (!chunk) chunk = this.addChunkForVoxel(x, y, z);
        const voxelOffset = this.computeVoxelOffset(x, y, z);
        chunk[voxelOffset] = voxel;
    }

    public getVoxel(x: number, y: number, z: number) {
        const chunk = this.getChunkForVoxel(x, y, z);
        if (!chunk) return 0;
        const voxelOffset = this.computeVoxelOffset(x, y, z);
        return chunk[voxelOffset];
    }

    public setblock(x: number, y: number, z: number, voxel: number) {
        let chunk = this.getChunkForVoxel(x, y, z);
        if (!chunk) chunk = this.addChunkForVoxel(x, y, z);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                for (let k = 0; k < 8; k++) {
                    const voxelOffset = this.computeVoxelOffset(x, y, z);
                    chunk[voxelOffset] = voxel;
                }
            }
        }
    }

    public generateGeometryData(chunkX: number, chunkY: number, chunkZ: number) {
        //BufferAttribute for BufferGeometry
        const positions = []; // vertex position data
        const normals = []; // vertex normal data
        const colors = []; // (r, g, b)
        const index = []; // vertext positions array

        const startX = chunkX << CHUNK_SIZE_BIT;
        const startY = chunkY << CHUNK_SIZE_BIT;
        const startZ = chunkZ << CHUNK_SIZE_BIT;

        for (let y = 0; y < CHUNK_SIZE; ++y) {
            const vY = startY + y;
            for (let z = 0; z < CHUNK_SIZE; ++z) {
                const vZ = startZ + z;
                for (let x = 0; x < CHUNK_SIZE; ++x) {
                    const vX = startX + x;

                    const voxel = this.getVoxel(vX, vY, vZ);
                    if (voxel) {
                        for (const {dir, corners} of FACES) {
                            const neighbor = this.getVoxel(vX + dir[0], vY + dir[1], vZ + dir[2]);
                            if (neighbor) continue;
                            const ndx = positions.length / 3;
                            corners.forEach(pos => {
                                positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                                normals.push(...dir);
                                colors.push(...this.palette.getRGB(voxel));
                            });
                            index.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                        }
                    }
                }
            }
        }
        return {positions, normals, colors, index};
    }

    public updateVoxelGeometry(x: number, y: number, z: number) {
        const updatedChunkIds = [];
        NEIGHBOR_OFFSETS.forEach(offset => {
            const oX = x + offset[0];
            const oY = y + offset[1];
            const oZ = z + offset[2];
            const chunkId = this.computeChunkId(oX, oY, oZ);
            if (!updatedChunkIds.includes(chunkId)) {
                updatedChunkIds.push(chunkId);
                this.updateChunkGeometry(oX, oY, oZ);
            }
        });
    }

    public updateChunkGeometry(x: number, y: number, z: number) {
        const cX = x >> CHUNK_SIZE_BIT;
        const cY = y >> CHUNK_SIZE_BIT;
        const cZ = z >> CHUNK_SIZE_BIT;
        const chunkId = this.computeChunkId(x, y, z);
        let mesh = this.meshs.get(chunkId);
        const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();

        const {positions, normals, colors, index} = this.generateGeometryData(cX, cY, cZ);
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), 3)
        );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normals), 3)
        );
        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(new Float32Array(colors), 3)
        );
        geometry.setIndex(index);

        if (!mesh) {
            mesh = new THREE.Mesh(geometry, _material);
            mesh.matrixAutoUpdate = false;
            mesh.name = chunkId;
            mesh.position.set(cX << CHUNK_SIZE_BIT, cY << CHUNK_SIZE_BIT, cZ << CHUNK_SIZE_BIT);
            this.meshs.set(chunkId, mesh);
        }

        // If chunk is empty
        if (index.length === 0) {
            this.chunks.delete(chunkId);
            this.meshs.delete(chunkId);
            geometry.dispose();
        }
        mesh.updateMatrix();
    }

    public clearAllChunks() {
        const {chunks, meshs} = this;
        chunks.forEach((_, chunkId) => {
            const chunkMesh = meshs.get(chunkId);
            this.scene.remove(chunkMesh);
            chunkMesh.geometry.dispose();
            meshs.delete(chunkId);
            this.chunks.delete(chunkId);
        });
    }

    private exportMapData() {
        return new Promise(resolve => {
            const dataObj = JSON.stringify(this.data);
            const DATA_LENGTH = dataObj.length;
            const data = new Uint8Array(DATA_LENGTH);
            for (let i = 0, j = DATA_LENGTH; i < j; i++) {
                data[i] = dataObj.charCodeAt(i) + CONVERSION;
            }
            resolve(data);
        });
    }

    private importMapData(uInt8Arr: Uint8Array) {
        let data = "";
        for (let i = 0, j = uInt8Arr.length; i < j; i++) {
            data += String.fromCharCode(uInt8Arr[i] - CONVERSION);
        }
        this.data = JSON.parse(data);
    }
}