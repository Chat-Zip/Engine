import engine from '..';
import keyEventListeners from '../controls/KeyEventListeners';

import { CrosshairElement } from '../elements/chatzip-crosshair';
import { PaletteElement } from '../elements/chatzip-palette';
import { MenuElement } from '../elements/chatzip-menu';
import { ControlsElement } from './chatzip-controls';

class RendererElement extends HTMLElement {
    private wrapper: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private crosshair: CrosshairElement;
    private palette: PaletteElement;
    private menu: MenuElement;
    private controls: ControlsElement;

    private enter: HTMLButtonElement;

    private styleElem: HTMLStyleElement;

    constructor() {
        super();

        const fontLink = document.createElement('link') as HTMLLinkElement;
        fontLink.setAttribute('rel', 'stylesheet');
        fontLink.setAttribute('href', 'https://cdn.jsdelivr.net/npm/galmuri/dist/galmuri.css');

        this.wrapper = document.createElement('div') as HTMLDivElement;
        this.wrapper.setAttribute('id', 'render-frame');
        this.wrapper.setAttribute('class', 'prevent-select');

        this.canvas = document.createElement('canvas') as HTMLCanvasElement;
        this.canvas.setAttribute('id', 'canvas');

        this.crosshair = new CrosshairElement();
        this.palette = new PaletteElement();
        this.menu = new MenuElement();
        this.controls = new ControlsElement();

        this.enter = document.createElement('button') as HTMLButtonElement;
        this.enter.textContent = 'ENTER';
        this.enter.onclick = () => {
            this.enter.classList.add('hide');
            this.wrapper.classList.remove('hide');
            engine.setFullScreen(true);
        }
        this.enter.classList.add('hide');

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
        .hide {
            display: none;
        }
        .prevent-select {
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10 and IE 11 */
            user-select: none; /* Standard syntax */
        }
        `;

        this.wrapper.append(fontLink, this.canvas, this.crosshair, this.palette, this.menu, this.controls);
        this.append(this.wrapper, this.enter, this.styleElem);
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
            const { width, height } = entries[0].contentRect;
            engine.renderer?.setSize(width, height);
            engine.dispatchEvent({ type: 'resize-render-frame', contentRect: entries[0].contentRect });
        }).observe(this.wrapper);

        engine.addEventListener('fullscreen-mode', (e) => {
            if (this.getAttribute('controls') === 'pointer') return;
            if (document.fullscreenElement === this.wrapper) {
                this.enter.classList.add('hide');
                this.wrapper.classList.remove('hide');
            }
            else {
                this.enter.classList.remove('hide');
                this.wrapper.classList.add('hide');
            }
        })

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
                        this.controls.classList.add('hide');
                        if (keyEventListeners.ui.has('KeyH')) return;
                        keyEventListeners.ui.set('KeyH', () => {
                            this.crosshair.classList.toggle('hide');
                            this.palette.classList.toggle('hide');
                            this.menu.classList.toggle('hide');
                        })
                        break;
                    case 'touch':
                        engine.setControls('touch');
                        this.controls.classList.remove('hide');
                        keyEventListeners.ui.delete('KeyH');

                        // this.crosshair.classList.add('hide');
                        // this.palette.classList.add('hide');
                        this.menu.classList.remove('hide');
                        // this.menu.removeAttribute('enable-editor');

                        if (document.fullscreenElement === this.wrapper) {
                            this.enter.classList.add('hide');
                            this.wrapper.classList.remove('hide');
                        }
                        else {
                            this.enter.classList.remove('hide');
                            this.wrapper.classList.add('hide');
                        }
                        break;
                }
                break;
            case 'enable-editor':
                if (this.hasAttribute(name)) {
                    this.palette.setAttribute('enable-editor', '');
                    this.menu.setAttribute('enable-editor', '');
                    this.controls.setAttribute('enable-editor', '');
                }
                else {
                    this.palette.removeAttribute('enable-editor');
                    this.menu.removeAttribute('enable-editor');
                    this.controls.removeAttribute('enable-editor');
                }
                break;
        }
    }

    static get observedAttributes() {
        return ['controls', 'enable-editor'];
    }
}

customElements.define('chatzip-renderer', RendererElement);