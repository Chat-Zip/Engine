export default class Palette {
    public colors: Array<string>;
    public list: Uint8Array;
    public selected: number;

    constructor(colors: Array<string>) {
        this.colors = colors;
        this.list = new Uint8Array([1, 23, 5, 7, 9, 14, 19, 29]);
        this.selected = 0
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