import { HemisphereLight } from "three";

export default class Light extends HemisphereLight {
    constructor(intensity: number) {
        super(0xffffff, 0xdbdbdb, intensity);
        this.matrixAutoUpdate = false;
    }
}