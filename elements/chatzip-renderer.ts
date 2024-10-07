import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import engine from '..';

@customElement('chatzip-renderer')
export class ChatZipRenderer extends LitElement {

    @query('#canvas') _canvas!: HTMLCanvasElement;
    @property({type: Boolean, attribute: 'enable-editor'}) enableEditor: Boolean = false;
    @property({type: String, attribute: 'controls'}) controls: String = 'pointer';

    static styles?: CSSResultGroup = css`
        #canvas {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
        }
    `;

    constructor() {
        super();
        console.log('chatzip-renderer: created', this._canvas);
    }

    connectedCallback(): void {
        super.connectedCallback();
        console.log('chatzip-renderer: added DOM', this._canvas);
    }

    disconnectedCallback(): void {
        engine.stop();
    }

    protected render() {
        return html`
            <canvas id="canvas"></canvas>
        `;
    }
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        console.log('chatzip-renderer: first updated', this._canvas);
        const { _canvas } = this;

        engine.setCanvasToRenderer(_canvas);
        engine.setControls(this.controls as 'pointer' | 'touch');
        if (this.enableEditor) engine.enableEditor(true);
        engine.start();
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