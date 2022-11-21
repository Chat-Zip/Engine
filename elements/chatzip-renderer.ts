import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import Engine from '..';
import PointerControls from '../controls/PointerControls';

@customElement('chatzip-renderer')
export class ChatZipRenderer extends LitElement {
    private _engine: Engine;

    @query('#canvas') _canvas!: HTMLCanvasElement;

    static styles?: CSSResultGroup = css`
        canvas {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
        }
    `;

    constructor() {
        super();
        console.log('chatzip-renderer: created', this._canvas);
        this._engine = new Engine();
    }

    connectedCallback(): void {
        super.connectedCallback();
        console.log('chatzip-renderer: added DOM', this._canvas);
    }

    disconnectedCallback(): void {
        this._engine.stop();
    }

    protected render() {
        return html`
            <canvas id="canvas"></canvas>
        `;
    }
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        console.log('chatzip-renderer: first updated', this._canvas);
        const { _canvas, _engine } = this;
        const pointerControls = new PointerControls(_engine.world.self, _canvas);

        _engine.setCanvasToRenderer(_canvas);
        _engine.setControls(pointerControls);
        _canvas.addEventListener('click', e => {
            pointerControls.lock();
            pointerControls.isLocked = true;
        });

        const movements = _engine.controls.movements;
        const movKey = pointerControls.keys.move;
        movKey.set('KeyW', (isDown: boolean) => movements.set('forward', isDown));
        movKey.set('ArrowUp', (isDown: boolean) => movements.set('forward', isDown));
        movKey.set('KeyS', (isDown: boolean) => movements.set('back', isDown));
        movKey.set('ArrowDown', (isDown: boolean) => movements.set('back', isDown));
        movKey.set('KeyA', (isDown: boolean) => movements.set('left', isDown));
        movKey.set('ArrowLeft', (isDown: boolean) => movements.set('left', isDown));
        movKey.set('KeyD', (isDown: boolean) => movements.set('right', isDown));
        movKey.set('ArrowRight', (isDown: boolean) => movements.set('right', isDown));
        movKey.set('Space', (isDown: boolean) => movements.set('top', isDown));
        movKey.set('LeftShift', (isDown: boolean) => movements.set('down', isDown));

        _engine.start();
    }
    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "chatzip-renderer": ChatZipRenderer;
    }
}