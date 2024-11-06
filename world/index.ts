import { Color, ColorRepresentation, LinearSRGBColorSpace, Scene } from "three";
import JSZip from "jszip";
import engine from "../";
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
    public skybox: Skybox;
    public light: Light;
    public map: WorldMap;
    public self: Self;
    public users: Map<string, User>;
    public spawnPoint: Array<number | undefined>;

    public file: ArrayBuffer | Blob | File | undefined;
    public infoHash: string | undefined;

    constructor() {
        super();
        this.skybox = new Skybox(undefined);
        this.light = new Light(Math.PI);
        this.map = new WorldMap(this);
        this.self = new Self(this);
        this.users = new Map<string, User>();
        this.spawnPoint = [undefined, undefined, undefined];

        this.background = new Color(0xa2d3ff).convertLinearToSRGB();
        this.add(this.light);

        this.editor = new Editor(this);

        this.infoHash = undefined;
        this.file = undefined;
    }

    public update(delta: number) {
        this.self.update(delta);
        this.users.forEach((user: User) => user.update(delta));
    }

    public setSpawnPoint() {
        const selfPos = this.self.state.pos;
        this.spawnPoint[0] = selfPos[0];
        this.spawnPoint[1] = selfPos[1];
        this.spawnPoint[2] = selfPos[2];
    }

    public goToSpawn() {
        const selfPos = this.self.state.pos;
        selfPos[0] = this.spawnPoint[0] !== undefined ? this.spawnPoint[0] : 0;
        selfPos[1] = this.spawnPoint[1] !== undefined ? this.spawnPoint[1] : 0;
        selfPos[2] = this.spawnPoint[2] !== undefined ? this.spawnPoint[2] : 0;
    }

    public async save(fileName: string) {
        if (this.spawnPoint[0] === undefined) {
            alert('맵의 스폰 위치를 설정해주세요!');
            return;
        }
        if (fileName.length === 0) return;
        const f = new JSZip();
        // const worldData = await this.exportWorldData();
        const worldData: WorldData = {
            backgroundColor: this.background instanceof Color ? this.background.getHex(LinearSRGBColorSpace) : 0xa2d3ff,
            intensity: this.light.intensity,
            paletteColors: this.map.palette.colors,
            spawnPoint: this.spawnPoint
        }
        const chunks = this.map.chunks;

        function saveWorldFile() {
            Promise.all([
                f.file('.chatzip', `${WORLD_VERSION}`), // file for version check
                f.file('data', JSON.stringify(worldData)),
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

        if (this.skybox.images?.[0]) skyboxWorker.postMessage(this.skybox.images);
        else {
            saveWorldFile();
            return;
        }

        let skyboxCount = 0;
        skyboxWorker.onmessage = ({data}: MessageEvent<{fileName: string, data: ArrayBuffer}>) => {
            f.file(`skybox/${data.fileName}`, data.data);
            if (++skyboxCount < 6) return;
            saveWorldFile();
        }
    }

    public load(file: ArrayBuffer | Blob | File) {
        this.file = file;
        const f = new JSZip();
        const map = this.map;
        const loadChunks: Promise<void>[] = [];
        const loadSkybox: Promise<void>[] = [];
        const skyboxImgUrls = new Array<string>(6);
        return new Promise(resolve => {
            f.loadAsync(file).then(() => {
                this.skybox.revokeImgUrls();
                map.clearAllChunks();
                const dataFile = f.file('data');
                if (!dataFile) return;
                dataFile.async('string').then(str => {
                    const worldData: WorldData = JSON.parse(str);
                    if (worldData.backgroundColor) this.background = new Color(worldData.backgroundColor).convertLinearToSRGB();
                    if (worldData.intensity) this.light.intensity = worldData.intensity;
                    if (worldData.paletteColors) this.map.palette.colors = worldData.paletteColors;
                    if (worldData.spawnPoint) this.spawnPoint = worldData.spawnPoint;
                    f.folder('chunks')?.forEach((chunk: string, file: JSZip.JSZipObject) => {
                        loadChunks.push(
                            file.async('uint8array').then((data: Uint8Array) => {
                                map.loadChunkFromData(chunk, data);
                            })
                        );
                    });
                    Promise.all(loadChunks).then(() => {
                        resolve(null);
                        engine.dispatchEvent({type: 'world-loaded'});
                    });
                });
                f.folder('skybox')?.forEach((fileName: string, file: JSZip.JSZipObject) => {
                    const skyboxDir = fileName.split('.')[0];
                    if (!SKYBOX_DIR.includes(skyboxDir)) {
                        loadSkybox.push(Promise.reject());
                        return;
                    };
                    loadSkybox.push(
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
                Promise.all(loadSkybox).then(() => {
                    if (skyboxImgUrls.length === 6) {
                        this.skybox.load(skyboxImgUrls)?.then(texture => this.background = texture);
                    }
                });
            });
        });
    }
}
