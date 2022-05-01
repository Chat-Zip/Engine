export default class Palette {
    public colors: Array<string>;
    public list : Uint8Array;

    constructor() {
        this.colors = [
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
        ];
        this.list = new Uint8Array([1, 23, 5, 7, 9, 14, 19, 29]);
    }

    public getRGB(voxel: number) {
        if (voxel < 0 || voxel > 64) {
            console.error('Out of index : Value of voxel is only allowed integer from 0 to 64.');
            return;
        }
        const hex = this.colors[voxel];
        return [
            parseInt(hex.charAt(1) + hex.charAt(2), 16) / 255,
            parseInt(hex.charAt(3) + hex.charAt(4), 16) / 255,
            parseInt(hex.charAt(5) + hex.charAt(6), 16) / 255,
        ];
    }
}