import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from "lit";
import { customElement, query } from "lit/decorators.js";
import engine from "..";
import eventKeyListeners from '../controls/KeyEventListeners';
import PointerControls from "../controls/PointerControls";

@customElement('chatzip-menu')
export class ChatZipMenu extends LitElement {

    @query('#menu') _menu?: HTMLDivElement;
    @query('#close') _close?: HTMLDivElement;
    @query('#open') _open?: HTMLDivElement;

    private isOpen;

    static styles: CSSResultGroup = css`
        #menu {
            position: absolute;
            top: 0;
            right: 0;
            margin: 16px;
            color: #ffffff;
            overflow-y: auto;
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
            border-radius: 16px;
            z-index: 1;
        }
        #close {
            background: #00000060;
            padding: 8px;
            // border-radius: 16px;
        }
        #open {
            display: none;
            background: #00000080;
            padding: 8px;
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
    }

    protected render() {
        return html`
            <div id="menu">
                <div id="close">MENU(M)</div>
                <div id="open">
                    <slot></slot>
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