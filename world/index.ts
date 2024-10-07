import { Scene, GridHelper } from "three";
import JSZip from "jszip";
import Skybox from "./components/Skybox";
import Light from "./components/Light";
import WorldMap from "./components/map";
import Self from "./components/user/Self";
import User from "./components/user/User";
import Editor from "./Editor";

import SKYBOX_PX from "../assets/skybox/px.png";
import SKYBOX_NX from "../assets/skybox/nx.png";
import SKYBOX_PY from "../assets/skybox/py.png";
import SKYBOX_NY from "../assets/skybox/ny.png";
import SKYBOX_PZ from "../assets/skybox/pz.png";
import SKYBOX_NZ from "../assets/skybox/nz.png";

const CONVERSION = 128;

export interface WorldData {
    skybox: Array<string>;
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
            skybox: [
                SKYBOX_PX,
                SKYBOX_NX,
                SKYBOX_PY,
                SKYBOX_NY,
                SKYBOX_PZ,
                SKYBOX_NZ
            ],
            intensity: 1,
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
        this.skybox = new Skybox(this.data.skybox);
        this.light = new Light(this.data.intensity);
        this.map = new WorldMap(this);
        this.self = new Self(this);
        this.users = new Map<string, User>();

        this.background = this.skybox.texture;
        this.add(this.light);

        this.editor = new Editor(this);
    }

    private exportWorldData(): Promise<Uint8Array> {
        return new Promise(resolve => {
            const dataObj = JSON.stringify(this.data);
            const sequence = [];
            for (let i = 0, j = dataObj.length; i < j; i++) {
                sequence.push(dataObj.charCodeAt(i) + CONVERSION);
            }
            Promise.all(sequence).then(arr => {
                resolve(new Uint8Array(arr));
            });
        });
    }

    private importWorldData(uInt8Arr: Uint8Array): Promise<WorldData> {
        return new Promise(resolve => {
            let data = "";
            for (let i = 0, j = uInt8Arr.length; i < j; i++) {
                data += String.fromCharCode(uInt8Arr[i] - CONVERSION);
            }
            resolve(JSON.parse(data));
        });
    }

    public update(delta: number) {
        this.self.update(delta);
        this.users.forEach((user: User) => user.update(delta));
    }

    public async save(fileName: string) {
        if (this.data.spawnPoint[0] === undefined) {
            alert('맵의 스폰 위치를 설정해주세요!');
            return;
        }
        if (fileName.length === 0) return;
        const worldData = await this.exportWorldData();
        const chunks = this.map.chunks;
        const f = new JSZip();
        f.file('data', worldData);
        chunks.forEach((data, id) => {
            f.file(`chunks/${id}`, data);
        });
        f.generateAsync({type: "blob", compression: "DEFLATE", compressionOptions: {level: 9}}).then(obj => {
            const url = URL.createObjectURL(obj);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.zip`;
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    public load(file: ArrayBuffer|Blob|File) {
        const f = new JSZip();
        const map = this.map;
        const updateChunks: Promise<void>[] = [];
        return new Promise(resolve => {
            f.loadAsync(file).then(() => {
                map.clearAllChunks();
                f.folder('chunks').forEach((chunk: string, file: JSZip.JSZipObject) => {
                    updateChunks.push(
                        file.async('uint8array').then((data: Uint8Array) => {
                            map.loadChunkFromData(chunk, data);
                        })
                    );
                });
                Promise.all(updateChunks).then(() => {
                    const dataFile = f.file('data');
                    if (dataFile) {
                        dataFile.async('uint8array').then((data: Uint8Array) => {
                            this.importWorldData(data).then((importData: WorldData) => {
                                if (importData.skybox) this.data.skybox = importData.skybox;
                                if (importData.intensity) this.data.intensity = importData.intensity;
                                if (importData.paletteColors) this.data.paletteColors = importData.paletteColors;
                                if (importData.spawnPoint) this.data.spawnPoint = importData.spawnPoint;
                                resolve(null);
                            });
                        });
                    }
                });
            });
        });
    }
}
