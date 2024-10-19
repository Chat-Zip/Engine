import engine from '..';
import PointerControls from '../controls/PointerControls';
import eventKeyListeners from '../controls/KeyEventListeners';

import { WorldFileManagerElement } from '../elements/chatzip-world-file-manager';

export class MenuElement extends HTMLElement {
    private wrapper: HTMLDivElement;
    private close: HTMLDivElement;
    private open: HTMLDivElement;
    private editor: HTMLDivElement;

    private fullScreen: HTMLButtonElement;
    private goToSpawnPoint: HTMLButtonElement;
    private setSpawnPoint: HTMLButtonElement;
    private worldFileManager: WorldFileManagerElement;

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
        // menu open - display
        const pDisplay = document.createElement('p') as HTMLParagraphElement;
        pDisplay.textContent = 'Display';
        // menu open - display => fullscrenen button
        this.fullScreen = document.createElement('button') as HTMLButtonElement;
        this.fullScreen.setAttribute('id', 'btn-fullscreen');
        this.fullScreen.textContent = 'FULLSCREEN';
        this.fullScreen.onclick = () => engine.setFullScreen(true);
        // menu open - World
        const pWorld = document.createElement('p') as HTMLParagraphElement;
        pWorld.textContent = 'World';
        // menu open - World => go to spawn button
        this.goToSpawnPoint = document.createElement('button') as HTMLButtonElement;
        this.goToSpawnPoint.setAttribute('id', 'btn-goto-spawn-point');
        this.goToSpawnPoint.textContent = 'GO TO SPAWN POINT';
        this.goToSpawnPoint.onclick = () => engine.world.goToSpawn();
        // menu open - Editor
        this.editor = document.createElement('div') as HTMLDivElement;
        this.editor.setAttribute('id', 'editor');
        const pEditor = document.createElement('p') as HTMLParagraphElement;
        pEditor.textContent = 'Editor';
        // menu open - Editor => world file manager
        this.worldFileManager = new WorldFileManagerElement();
        // menu open - Editor => set spawn point
        this.setSpawnPoint = document.createElement('button') as HTMLButtonElement;
        this.setSpawnPoint.setAttribute('id', 'btn-set-spawn-point');
        this.setSpawnPoint.textContent = 'SET SPAWN POINT';
        this.setSpawnPoint.onclick = () => engine.world.setSpawnPoint();

        this.editor.append(
            pEditor,
            this.worldFileManager,
            this.setSpawnPoint
        );
        this.open.append(
            pDisplay,
            this.fullScreen,
            document.createElement('hr'),
            pWorld,
            this.goToSpawnPoint,
            this.editor
        );
        this.wrapper.appendChild(this.open);

        this.styleElem = document.createElement('style') as HTMLStyleElement;
        this.styleElem.textContent = `
        #menu {
            position: absolute;
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
        .hide {
            display: none;
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
        if (enable) this.editor.classList.remove('hide');
        else this.editor.classList.add('hide');
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