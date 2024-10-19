import engine from '..';

import { CrosshairElement } from '../elements/chatzip-crosshair';
import { PaletteElement } from '../elements/chatzip-palette';
import { MenuElement } from '../elements/chatzip-menu';

class RendererElement extends HTMLElement {
    private wrapper: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private crosshair: CrosshairElement;
    private palette: PaletteElement;
    private menu: MenuElement;

    private styleElem: HTMLStyleElement;

    constructor() {
        super();

        const fontLink = document.createElement('link') as HTMLLinkElement;
        fontLink.setAttribute('rel', 'stylesheet');
        fontLink.setAttribute('href', 'https://cdn.jsdelivr.net/npm/galmuri/dist/galmuri.css');

        this.wrapper = document.createElement('div') as HTMLDivElement;
        this.wrapper.setAttribute('id', 'render-frame');

        this.canvas = document.createElement('canvas') as HTMLCanvasElement;
        this.canvas.setAttribute('id', 'canvas');

        this.crosshair = new CrosshairElement();
        this.palette = new PaletteElement();
        this.menu = new MenuElement();

        this.styleElem = document.createElement('style') as HTMLStyleElement;
        this.styleElem.textContent = `
        #render-frame {
            font-family: "Galmuri11", sans-serif;
            width: 960px;
            height: 540px;
            position: relative;
        }
        #canvas {
            border-radius: 2rem;
            position: absolute;
            z-index: 0;
        }
        `;

        this.wrapper.append(fontLink, this.canvas, this.crosshair, this.palette, this.menu);
        this.append(this.wrapper, this.styleElem);
    }

    connectedCallback() {
        requestAnimationFrame(() => this.mounted());
    }

    private mounted() {
        engine.setRenderer(this.wrapper, this.canvas);
        if (this.hasAttribute('controls')) {
            if (['pointer', 'touch'].includes(this.getAttribute('controls')!)) {
                engine.setControls(this.getAttribute('controls') as 'pointer' | 'touch');
            }
            else engine.setControls('pointer');
        }
        else engine.setControls('pointer');
        console.log(this.hasAttribute('enable-editor'));
        engine.enableEditor(this.hasAttribute('enable-editor'));

        new ResizeObserver(entries => {
            const {width, height} = entries[0].contentRect;
            engine.renderer?.setSize(width, height);
            engine.dispatchEvent({type: 'resize-render-frame', contentRect: entries[0].contentRect});
        }).observe(this.wrapper);

        engine.start();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        console.log(name, oldValue, newValue);
        switch (name) {
            case 'controls':
                if (oldValue === newValue) return;
                switch (newValue) {
                    case 'pointer':
                        engine.setControls('pointer');
                        break;
                    case 'touch':
                        engine.setControls('touch');
                        break;
                }
                break;
            case 'enable-editor':
                if (this.hasAttribute(name)) {
                    this.palette.setAttribute('enable-editor', '');
                    this.menu.setAttribute('enable-editor', '');
                }
                else {
                    this.palette.removeAttribute('enable-editor');
                    this.menu.removeAttribute('enable-editor');
                }
                break;
        }
    }

    static get observedAttributes() {
        return ['controls', 'enable-editor'];
    }
}

customElements.define('chatzip-renderer', RendererElement);