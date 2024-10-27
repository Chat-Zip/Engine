import engine from '..';
import PointerControls from '../controls/PointerControls';
import eventKeyListeners from '../controls/KeyEventListeners';

import { MenuDisplayElement } from './menu/chatzip-menu-display';
import { MenuWorldElement } from './menu/chatzip-menu-world';
import { MenuEditorElement } from './menu/chatzip-menu-editor';

export class MenuElement extends HTMLElement {
    private wrapper: HTMLDivElement;
    private close: HTMLDivElement;
    private open: HTMLDivElement;

    private displayMenu: MenuDisplayElement;
    private worldMenu: MenuWorldElement;
    private editorMenu: MenuEditorElement;

    private styleElem: HTMLStyleElement;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        // menu
        this.wrapper = document.createElement('div') as HTMLDivElement;
        this.wrapper.setAttribute('id', 'menu');

        // menu close
        this.close = document.createElement('div') as HTMLDivElement;
        this.close.setAttribute('id', 'close');
        this.close.textContent = 'MENU(M)';
        this.close.onclick = () => this.setAttribute('open', '');
        this.wrapper.appendChild(this.close);

        // menu open
        this.open = document.createElement('div') as HTMLDivElement;
        this.open.setAttribute('id', 'open');

        const closeButton = document.createElement('button') as HTMLButtonElement;
        closeButton.setAttribute('id', 'btn-menu-close');
        closeButton.textContent = 'X';
        closeButton.onclick = () => this.showMenuUI(false);

        this.displayMenu = new MenuDisplayElement();
        this.worldMenu = new MenuWorldElement();
        this.editorMenu = new MenuEditorElement();

        this.open.append(
            closeButton,
            this.displayMenu,
            this.worldMenu,
            this.editorMenu
        );
        this.wrapper.appendChild(this.open);

        this.styleElem = document.createElement('style') as HTMLStyleElement;
        this.styleElem.textContent = `
        #menu {
            position: absolute;
            max-height: 492px;
            top: 0;
            right: 0;
            margin: 16px;
            padding: 8px;
            color: #ffffff;
            background: #00000060;
            overflow-y: auto;
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
            border-radius: 16px;
            z-index: 1;
        }
        #open {
            gap-y: 8px;
        }
        #btn-menu-close {
            color: #ffffff;
            padding: 4px 16px;
            background: transparent;
            border: solid;
            border-color: #ffffffd0;
            border-width: 2px;
        }
        .hide {
            display: none;
        }
        button {
            font-family: "Galmuri11", sans-serif;
            padding: 4px;
            border-radius: 16px;
            border: none;
            background: #ffffffd0;
            margin: 4px;
        }
        button:hover {
            background: #ffffff;
        }
        input {
            font-family: "Galmuri11", sans-serif;
            padding: 4px;
            border-radius: 16px;
            border: none;
            margin: 4px;
        }
        `;

        shadowRoot.append(this.wrapper, this.styleElem);
    }

    connectedCallback() {
        requestAnimationFrame(() => this.mounted());
    }

    private showMenuUI(open: boolean) {
        if (open) {
            this.open.classList.remove('hide');
            this.close.classList.add('hide');
        }
        else {
            this.open.classList.add('hide');
            this.close.classList.remove('hide');
        }
    }

    private enableEditor(enable: boolean) {
        if (enable) this.editorMenu.classList.remove('hide');
        else this.editorMenu.classList.add('hide');
    }

    private mounted() {
        if (engine.controls) {
            if (engine.controls instanceof PointerControls) {
                const pointerControls = engine.controls as PointerControls;
                pointerControls.addEventListener('lock', () => {
                    this.removeAttribute('open');
                })
                eventKeyListeners.ui.set('KeyM', () => {
                    if (this.hasAttribute('open')) {
                        this.removeAttribute('open');
                    }
                    else {
                        this.setAttribute('open', '');
                        pointerControls.unlock();
                    }
                });
            }
        }
        else {
            requestAnimationFrame(() => this.mounted());
            return;
        }
        
        engine.addEventListener('resize-render-frame', (e) => {
            const { height } = e.contentRect;
            this.wrapper.style.maxHeight = `${height - 48}px`;
        });

        engine.addEventListener('change-editor-mode', (e) => {
            if (e.enable) this.setAttribute('enable-editor', '');
            else this.removeAttribute('enable-editor');
        });

        this.enableEditor(this.hasAttribute('enable-editor'));
        this.showMenuUI(false);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'open':
                this.showMenuUI(this.hasAttribute(name));
                break;
            case 'enable-editor':
                this.enableEditor(this.hasAttribute(name));
                break;
        }
    }

    static get observedAttributes() {
        return ['open', 'enable-editor'];
    }
}

customElements.define('chatzip-menu', MenuElement);