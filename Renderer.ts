import { LinearSRGBColorSpace, WebGLRenderer } from 'three';
import engine from '.';

export default class Renderer extends WebGLRenderer {

    private camera;

    constructor(canvas: HTMLCanvasElement) {
        super({canvas});
        this.outputColorSpace = LinearSRGBColorSpace;
        this.camera = engine.world.self.camera;
        this.camera.aspect = canvas.width / canvas.height;
        this.camera.updateProjectionMatrix();
    }
    
    public setSize(width: number, height: number, updateStyle?: boolean) {
        super.setSize(width, height, updateStyle);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}