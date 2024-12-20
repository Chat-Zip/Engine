import { Clock, EventDispatcher } from "three";
import World from "./world";
import Controls from "./controls/Controls";
import Renderer from "./Renderer";
import PointerControls from "./controls/PointerControls";
import eventKeyListeners from "./controls/KeyEventListeners";
import TouchControls from "./controls/TouchControls";

const clock = new Clock();
const TICK = 0.1;
let duration = 0;

export class Engine extends EventDispatcher {
    public world: World;
    public controls: Controls | undefined;
    public renderer: Renderer | undefined;

    public tickUpdate: boolean;
    public fullScreenMode: boolean;

    public renderFrameElement: HTMLElement | undefined;

    constructor() {
        super();
        this.world = new World();
        this.controls = undefined;
        this.renderer = undefined;
        this.tickUpdate = true;
        this.fullScreenMode = false;
        this.renderFrameElement = undefined;
    }

    public setRenderer(renderFrameElement: HTMLElement, canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.renderFrameElement = renderFrameElement;
        this.renderFrameElement.addEventListener('fullscreenchange', () => {
            this.fullScreenMode = document.fullscreenElement === this.renderFrameElement ? true : false;
            this.dispatchEvent({type: 'fullscreen-mode', active: this.fullScreenMode});
        });
        // new ResizeObserver(entries => {
        //     const {width, height} = entries[0].contentRect;
        //     this.renderer?.setSize(width, height);
        // }).observe(this.renderer.domElement);

        // window.addEventListener('resize', () => {
        //     const width = window.innerWidth;
        //     const height = window.innerHeight;
        //     this.renderer?.setSize(width, height, false);
        //     camera.aspect = width / height;
        //     camera.updateProjectionMatrix();
        // });
    }

    public setControls(controls: 'pointer' | 'touch') {
        const { world, renderer } = this;
        if (!renderer) {
            console.error('You must call setCanvasToRednerer() before use this function.');
            return;
        }
        switch (controls) {
            case 'pointer':
                const pointerControls = new PointerControls(world.self, renderer.domElement);
                this.controls = pointerControls;
                this.world.self.controls = pointerControls;
                renderer.domElement.addEventListener('click', e => {
                    pointerControls.lock();
                });
                const movements = this.controls.movements;
                const movKey = eventKeyListeners.move;
                movKey.set('KeyW', (isDown: boolean) => movements.set('forward', isDown));
                movKey.set('ArrowUp', (isDown: boolean) => movements.set('forward', isDown));
                movKey.set('KeyS', (isDown: boolean) => movements.set('back', isDown));
                movKey.set('ArrowDown', (isDown: boolean) => movements.set('back', isDown));
                movKey.set('KeyA', (isDown: boolean) => movements.set('left', isDown));
                movKey.set('ArrowLeft', (isDown: boolean) => movements.set('left', isDown));
                movKey.set('KeyD', (isDown: boolean) => movements.set('right', isDown));
                movKey.set('ArrowRight', (isDown: boolean) => movements.set('right', isDown));
                // movKey.set('Space', (isDown: boolean) => movements.set('top', isDown));
                // movKey.set('ShiftLeft', (isDown: boolean) => movements.set('down', isDown));
                pointerControls.addEventListener('unlock', () => {
                    pointerControls.unlock();
                });
                break;
            case 'touch':
                const touchControls = new TouchControls(world.self, renderer.domElement);
                this.controls = touchControls
                this.world.self.controls = touchControls;
                break;
        }
        
    }

    public enableEditor(enable: boolean) {
        const { world, controls, renderer } = this;
        if (!(controls instanceof PointerControls)) {
            console.error('Only PointerControls can use editor mode.');
            return;
        }

        const editor = world.editor;
        const movements = controls.movements;
        const movKey = eventKeyListeners.move;

        this.dispatchEvent({type: 'change-editor-mode', enable: enable});
        
        if (enable) {
            if (editor.abortController.signal.aborted) editor.initAbortController();

            controls.addEventListener('lock', () => {
                renderer?.domElement.addEventListener('pointerdown', editor.placeVoxel);
                controls?.addEventListener('change', editor.selectVoxel);
            }, {signal: editor.abortController.signal});

            controls.addEventListener('unlock', () => {
                renderer?.domElement.removeEventListener('pointerdown', editor.placeVoxel);
                controls?.removeEventListener('change', editor.selectVoxel);
            }, {signal: editor.abortController.signal});

            world.self.gravity.isActive = false;
            world.map.applyGridHelper(true);

            movKey.set('Space', (isDown: boolean) => movements.set('top', isDown));
            movKey.set('ShiftLeft', (isDown: boolean) => movements.set('down', isDown));
        }
        else {
            editor.abortController.abort();

            world.self.gravity.isActive = true;
            world.map.applyGridHelper(false);

            movKey.set('Space', (isDown: boolean) => movements.set('jump', isDown));
            movKey.delete('ShiftLeft');
        }
    }

    public setFullScreen(isFullScreen: boolean) {
        if (!this.renderFrameElement) {
            console.error('You must call setRednerer() before use this function.');
            return;
        }
        if (isFullScreen) this.renderFrameElement.requestFullscreen({navigationUI: "hide"});
        else document.exitFullscreen();
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