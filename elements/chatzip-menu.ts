import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import engine from "..";
import eventKeyListeners from '../controls/KeyEventListeners';
import PointerControls from "../controls/PointerControls";

import '../elements/chatzip-world-file-manager';

@customElement('chatzip-menu')
export class ChatZipMenu extends LitElement {

    @query('#menu') _menu?: HTMLDivElement;
    @query('#menu-close') _close?: HTMLDivElement;
    @query('#menu-open') _open?: HTMLDivElement;
    @query('#menu-editor') _menu_editor?: HTMLDivElement;

    @query('#btn-fullscreen') _btn_fullscreen?: HTMLButtonElement;
    @query('#btn-goto-spawn-point') _btn_goto_spawn_point?: HTMLButtonElement;
    @query('#btn-set-spawn-point') _btn_set_spawn_point?: HTMLButtonElement;

    @property({ type: Boolean, attribute: 'enable-editor' }) enableEditor: Boolean = false;

    private isOpen;

    static styles: CSSResultGroup = css`
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
        #menu-close {
            // border-radius: 16px;
        }
        #menu-open {
            display: none;
            gap-y: 8px;
        }
        #menu-editor {
            display: none;
        }
    `;

    private showMenuUI(show: boolean) {
        if (!this._menu || !this._close || !this._open) return;
        this.isOpen = show;
        this._close.style.display = show ? 'none' : 'block';
        this._open.style.display = show ? 'block' : 'none';
    }

    constructor() {
        super();
        this.isOpen = false;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const controls = engine.controls;

        if (controls instanceof PointerControls) {
            const pointerControls = engine.controls as PointerControls;

            pointerControls.addEventListener('lock', () => {
                this.showMenuUI(false);
            })

            eventKeyListeners.ui.set('KeyM', () => {
                this.showMenuUI(!this.isOpen);
                if (this.isOpen) {
                    pointerControls.unlock();
                }
            });
        }

        engine.addEventListener('resize-render-frame', (e) => {
            if (!this._menu) return;
            const { height } = e.contentRect;
            this._menu.style.maxHeight = `${height - 32}px`;
        });

        engine.addEventListener('change-editor-mode', (e) => {
            this._menu_editor!.style.display = e.enable ? 'block' : 'none';
        });

        this._menu_editor!.style.display = this.enableEditor ? 'block' : 'none';

        if (this._btn_fullscreen) {
            this._btn_fullscreen.onclick = () => engine.setFullScreen(true);
        }
        if (this._btn_goto_spawn_point) {
            this._btn_goto_spawn_point.onclick = () => engine.world.goToSpawn();
        }
        if (this._btn_set_spawn_point) {
            this._btn_set_spawn_point.onclick = () => engine.world.setSpawnPoint();
        }
    }

    protected render() {
        return html`
            <div id="menu">
                <div id="menu-close">MENU(M)</div>
                <div id="menu-open">
                    <p>Display</p>
                    <button id="btn-fullscreen">FULLSCREEN</button>
                    <hr>
                    <p>World</p>
                    <button id="btn-goto-spawn-point">GO TO SPAWN POINT</button>
                    <div id="menu-editor">
                        <hr>
                        <p>Editor<p>
                        <chatzip-world-file-manager></chatzip-world-file-manager>
                        <button id="btn-set-spawn-point">SET SPAWN POINT</button>
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "chatzip-menu": ChatZipMenu;
    }
}