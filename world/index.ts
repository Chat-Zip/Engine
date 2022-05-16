import { Scene } from "three";
import JSZip from "jszip";
import Skybox from "./components/Skybox";
import Light from "./components/Light";
import WorldMap from "./components/map";

const CONVERSION = 128;

export interface WorldData {
    skybox: Array<string>;
    intensity: number;
    paletteColors: Array<string>;
    spawnPoint: Array<number>;
}

export default class World extends Scene {
    public data: WorldData;
    public skybox: Skybox;
    public light: Light;
    public map: WorldMap;

    constructor() {
        super();
        this.data = {
            skybox: [
                '../assets/skybox/px.png',
                '../assets/skybox/nx.png',
                '../assets/skybox/py.png',
                '../assets/skybox/ny.png',
                '../assets/skybox/pz.png',
                '../assets/skybox/nz.png',
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
    }

    private exportWorldData() {
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

    private importWorldData(uInt8Arr: Uint8Array) {
        return new Promise(resolve => {
            const sequence = [];
            for (let i = 0, j = uInt8Arr.length; i < j; i++) {
                sequence.push(String.fromCharCode(uInt8Arr[i] - CONVERSION));
            }
            Promise.all(sequence).then(arr => {
                resolve(JSON.parse(arr.toString().replace(/,/g, "")));
            });
        });
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
        f.generateAsync({type: "blob"}).then(obj => {
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
                            this.importWorldData(data);
                            resolve(null);
                        });
                    }
                });
            });
        });
    }
}
