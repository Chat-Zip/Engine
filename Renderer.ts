import { WebGLRenderer } from 'three';

export default class Renderer extends WebGLRenderer {
    constructor(canvas: HTMLCanvasElement) {
        super({canvas})
        this.setSize(window.innerWidth, window.innerHeight, false);
    }
}