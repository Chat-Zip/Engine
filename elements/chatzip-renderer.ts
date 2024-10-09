import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import engine from '..';

import '../elements/chatzip-crosshair';
import '../elements/chatzip-palette';
import '../elements/chatzip-world-file-manager';

@customElement('chatzip-renderer')
export class ChatZipRenderer extends LitElement {

    @query('#render-frame') _render_frame!: HTMLDivElement;
    @query('#canvas') _canvas!: HTMLCanvasElement;

    @property({ type: Boolean, attribute: 'enable-editor' }) enableEditor: Boolean = false;
    @property({ type: String, attribute: 'controls' }) controls: String = 'pointer';

    @property({ type: String, attribute: 'render-frame-style'}) renderFrameStyle = css`
        width: 960px;
        height: 540px;
    `;
    @property({ type: String, attribute: 'canvas-style'}) canvasStyle = css``;

    constructor() {
        super();
        console.log('chatzip-renderer: created', this._canvas);
    }

    connectedCallback(): void {
        super.connectedCallback();
        console.log('chatzip-renderer: added DOM', this._canvas);
    }

    disconnectedCallback(): void {
        console.log('chatzip-renderer: removed DOM', this._canvas);
        engine.stop();
    }

    protected render() {
        return html`
            <style>
                #render-frame {
                    ${this.renderFrameStyle}
                    position: relative;
                }
                #canvas {
                    ${this.canvasStyle}
                    position: absolute;
                    z-index: 0;
                }
            </style>
            <div id="render-frame">
                <canvas id="canvas"></canvas>
                <chatzip-crosshair></chatzip-crosshair>
                ${this.enableEditor ? html`<chatzip-palette></chatzip-palette>` : ""}
                <chatzip-world-file-manager></chatzip-world-file-manager>
            </div>
        `;
    }
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        console.log('chatzip-renderer: first updated', this.renderRoot);
        const { _render_frame, _canvas } = this;
        engine.setRenderer(_render_frame, _canvas);
        engine.setControls(this.controls as 'pointer' | 'touch');
        engine.enableEditor(this.enableEditor ? true : false);
        new ResizeObserver(entries => {
            const {width, height} = entries[0].contentRect;
            engine.renderer?.setSize(width, height);
        }).observe(_render_frame);
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