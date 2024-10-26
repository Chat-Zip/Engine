import { Color, ColorRepresentation, Scene } from "three";
import JSZip from "jszip";
import Skybox from "./components/Skybox";
import Light from "./components/Light";
import WorldMap from "./components/map";
import Self from "./components/user/Self";
import User from "./components/user/User";
import Editor from "./Editor";

import { skyboxWorker } from "../workers";

const WORLD_VERSION = 1;
const SKYBOX_DIR = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

export interface WorldData {
    backgroundColor: ColorRepresentation;
    intensity: number;
    paletteColors: Array<string>;
    spawnPoint: Array<number | undefined>;
}

export default class World extends Scene {
    public editor: Editor;
    public data: WorldData;
    public skybox: Skybox;
    public light: Light;
    public map: WorldMap;
    public self: Self;
    public users: Map<string, User>;

    constructor() {
        super();
        this.data = {
            backgroundColor: 0xa2d3ff,
            intensity: Math.PI,
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
        }
        this.skybox = new Skybox(undefined);
        this.light = new Light(this.data.intensity);
        this.map = new WorldMap(this);
        this.self = new Self(this);
        this.users = new Map<string, User>();

        this.background = new Color(this.data.backgroundColor).convertLinearToSRGB();
        this.add(this.light);

        this.editor = new Editor(this);
    }

    public update(delta: number) {
        this.self.update(delta);
        this.users.forEach((user: User) => user.update(delta));
    }

    public setSpawnPoint() {
        const spawnPoint = this.data.spawnPoint;
        const selfPos = this.self.state.pos;
        spawnPoint[0] = selfPos[0];
        spawnPoint[1] = selfPos[1];
        spawnPoint[2] = selfPos[2];
    }

    public goToSpawn() {
        const spawnPoint = this.data.spawnPoint;
        const selfPos = this.self.state.pos;
        selfPos[0] = spawnPoint[0] !== undefined ? spawnPoint[0] : 0;
        selfPos[1] = spawnPoint[1] !== undefined ? spawnPoint[1] : 0;
        selfPos[2] = spawnPoint[2] !== undefined ? spawnPoint[2] : 0;
    }

    public async save(fileName: string) {
        if (this.data.spawnPoint[0] === undefined) {
            alert('맵의 스폰 위치를 설정해주세요!');
            return;
        }
        if (fileName.length === 0) return;
        const f = new JSZip();
        // const worldData = await this.exportWorldData();
        const worldData = JSON.stringify(this.data);
        const chunks = this.map.chunks;

        function saveWorldFile() {
            Promise.all([
                f.file('.chatzip', `${WORLD_VERSION}`), // file for version check
                f.file('data', worldData),
                chunks.forEach((data, id) => f.file(`chunks/${id}`, data)),
            ]).then(() => {
                f.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } }).then(obj => {
                    const url = URL.createObjectURL(obj);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${fileName}.zip`;
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                });
            });
        }

        if (this.skybox?.images) skyboxWorker.postMessage(this.skybox.images);
        else saveWorldFile();

        let skyboxCount = 0;
        skyboxWorker.onmessage = ({data}: MessageEvent<{fileName: string, data: ArrayBuffer}>) => {
            f.file(`skybox/${data.fileName}`, data.data);
            if (++skyboxCount < 6) return;
            saveWorldFile();
        }
    }

    public load(file: ArrayBuffer | Blob | File) {
        const f = new JSZip();
        const map = this.map;
        const updateChunks: Promise<void>[] = [];
        const updateSkybox: Promise<void>[] = [];
        const skyboxImgUrls = new Array<string>(6);
        return new Promise(resolve => {
            f.loadAsync(file).then(() => {
                this.skybox.revokeImgUrls();
                map.clearAllChunks();
                f.folder('chunks')?.forEach((chunk: string, file: JSZip.JSZipObject) => {
                    updateChunks.push(
                        file.async('uint8array').then((data: Uint8Array) => {
                            map.loadChunkFromData(chunk, data);
                        })
                    );
                });
                f.folder('skybox')?.forEach((fileName: string, file: JSZip.JSZipObject) => {
                    const skyboxDir = fileName.split('.')[0];
                    if (!SKYBOX_DIR.includes(skyboxDir)) {
                        updateSkybox.push(Promise.reject());
                        return;
                    };
                    updateSkybox.push(
                        file.async('arraybuffer').then(arrBuf => {
                            skyboxImgUrls[
                                skyboxDir === 'px' ? 0 :
                                skyboxDir === 'nx' ? 1 :
                                skyboxDir === 'py' ? 2 :
                                skyboxDir === 'ny' ? 3 :
                                skyboxDir === 'pz' ? 4 :
                                5
                            ] = URL.createObjectURL(new Blob([arrBuf], {type: "image/png"}));
                        })
                    );
                });
                Promise.all(updateChunks).then(() => {
                    const dataFile = f.file('data');
                    if (!dataFile) return;
                    dataFile.async('string').then(str => {
                        const worldData: WorldData = JSON.parse(str);
                        if (worldData.backgroundColor) this.data.backgroundColor = worldData.backgroundColor;
                        if (worldData.intensity) {
                            this.data.intensity = worldData.intensity;
                            this.light.intensity = worldData.intensity;
                        }
                        if (worldData.paletteColors) this.data.paletteColors = worldData.paletteColors;
                        if (worldData.spawnPoint) this.data.spawnPoint = worldData.spawnPoint;
                        resolve(null);
                    });
                });
                Promise.all(updateSkybox).then(() => {
                    if (skyboxImgUrls[0]) {
                        this.skybox = new Skybox(skyboxImgUrls);
                        this.background = this.skybox.texture;
                    }
                    else {
                        this.background = new Color(this.data.backgroundColor).convertLinearToSRGB();
                    }
                });
            });
        });
    }
}
