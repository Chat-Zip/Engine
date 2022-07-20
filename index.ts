import { Clock } from "three";
import World from "./world";
import Controls from "./controls/Controls";
import Renderer from "./Renderer";

const clock = new Clock();
const TICK = 0.1;
let duration = 0;

export default class Engine {
    public world: World;
    public controls: Controls;
    public renderer: Renderer;

    public tickUpdate: boolean;
    public updates: Array<object>;

    constructor() {
        this.world = new World();
        this.controls = this.world.self.controls;
        this.renderer = undefined;
        this.tickUpdate = true;
        this.updates = [this.world.self];
    }

    private tick() {
        const { controls } = this;
        if (controls === undefined) {
            return;
        }
        controls.tick();
    }

    public setControls(controls: Controls) {
        this.world.self.controls = controls;
    }

    public setCanvasToRenderer(canvas: HTMLCanvasElement) {
        const camera = this.world.self.camera;
        this.renderer = new Renderer(canvas);

        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
    }

    public start() {
        const { renderer } = this;
        if (renderer === undefined) {
            console.error('Please select the canvas element using setCanvasToRenderer()');
            return;
        }
        const { world, tickUpdate, updates } = this;
        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta();
            const self = world.self;

            for (let i = 0, j = updates.length; i < j; i++) {
                updates[i].update(delta);
            }

            renderer.render(world, self.camera);

            if (!tickUpdate) return;
            duration += delta;
            if (duration < TICK) return;
            this.tick();
            duration = 0;
        });
    }

    public stop() {
        this.renderer.setAnimationLoop(null);
    }
}
