import { Clock } from "three";
import World from "./world";
import TouchControls from "./controls/TouchControls";
import PointerControls from "./controls/PointerControls";
import Renderer from "./Renderer";

const clock = new Clock();
const TICK = 0.1;
let duration = 0;

const userAgent = navigator.userAgent;
const isMobile = userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('Android') > -1 || userAgent.indexOf('iPad') > -1 || userAgent.indexOf('iPod') > -1;

export default class Engine {
    public world: World;
    public controls: TouchControls | PointerControls;
    public renderer: Renderer;

    public tickUpdate: boolean;

    constructor() {
        this.world = new World();
        this.controls = undefined;
        this.renderer = undefined;
        this.tickUpdate = true;
    }

    private tick() {
        this.controls.tick();
    }

    private loop() {
        const { world, renderer, tickUpdate } = this;
        const delta = clock.getDelta();
        const self = world.self;

        self.update(delta);

        renderer.render(world, self.camera);

        if (!tickUpdate) return;
        duration += delta;
        if (duration < TICK) return;
        this.tick();
        duration = 0;
    }

    public setCanvasToRenderer(canvas: HTMLCanvasElement) {
        const self = this.world.self;
        const camera = self.camera;
        this.renderer = new Renderer(canvas);
        this.controls = isMobile ? new TouchControls(self, canvas, self.peers) : new PointerControls(self, canvas, self.peers);
        self.setControls(this.controls);

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
        renderer.setAnimationLoop(this.loop);
    }

    public stop() {
        this.renderer.setAnimationLoop(null);
    }
}
