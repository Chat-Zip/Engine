import { Clock } from "three";
import World from "./world";
import Controls from "./controls/Controls";
import Renderer from "./Renderer";
import PointerControls from "./controls/PointerControls";

const clock = new Clock();
const TICK = 0.1;
let duration = 0;

export class Engine {
    public world: World;
    public controls: Controls | undefined;
    public renderer: Renderer | undefined;

    public tickUpdate: boolean;

    constructor() {
        this.world = new World();
        this.controls = undefined;
        this.renderer = undefined;
        this.tickUpdate = true;
    }

    public setControls(controls: Controls) {
        this.controls = controls;
        this.world.self.controls = controls;
    }

    public setCanvasToRenderer(canvas: HTMLCanvasElement) {
        const camera = this.world.self.camera;
        this.renderer = new Renderer(canvas);

        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.renderer?.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
    }

    public enableEditor(enable: boolean) {
        const { world, controls, renderer } = this;
        if (!(controls instanceof PointerControls)) return;
        if (enable) {
            controls?.addEventListener('lock', () => {
                renderer?.domElement.addEventListener('pointerdown', world.editor.placeVoxel);
                controls.addEventListener('change', world.editor.selectVoxel);
            });
            controls.addEventListener('unlock', () => {
                renderer?.domElement.removeEventListener('pointerdown', world.editor.placeVoxel);
                controls.removeEventListener('change', world.editor.selectVoxel);
            })
        }
    }

    public start() {
        const { renderer } = this;
        if (renderer === undefined) {
            console.error('Please select the canvas element using setCanvasToRenderer()');
            return;
        }
        const { world, tickUpdate } = this;
        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta();
            const self = world.self;

            world.update(delta);
            renderer.render(world, self.camera);

            if (!tickUpdate) return;
            duration += delta;
            if (duration < TICK) return;
            self.tick();
            duration = 0;
        });
    }

    public stop() {
        this.renderer?.setAnimationLoop(null);
    }
}

export default new Engine();