import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from "lit";
import { customElement, query } from "lit/decorators.js";
import engine from "..";
import eventKeyListeners from '../controls/KeyEventListeners';
import PointerControls from "../controls/PointerControls";

@customElement('chatzip-menu')
export class ChatZipMenu extends LitElement {

    @query('#menu') _menu?: HTMLDivElement;

    private isOpen;

    static styles: CSSResultGroup = css`
        #menu {
            position: absolute;
            display: none;
            background: #00000080;
            right: 0;
            margin: 1rem;
            padding: 8px;
            border-radius: 16px;
            z-index: 1;
        }
    `;

    constructor() {
        super();
        this.isOpen = false;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const controls = engine.controls;

        if (controls instanceof PointerControls) {
            const pointerControls = engine.controls as PointerControls;

            pointerControls.addEventListener('lock', () => {
                this.isOpen = false;
                if (!this._menu) return;
                this._menu.style.display = 'none';
            })

            eventKeyListeners.ui.set('KeyM', () => {
                if (!this._menu) return;
                this.isOpen = !this.isOpen;
                this._menu.style.display = this.isOpen ? 'unset' : 'none';
                if (this.isOpen) {
                    pointerControls.unlock();
                }
            });
        }
    }

    protected render() {
        return html`
            <div id="menu">
                <slot></slot>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "chatzip-menu": ChatZipMenu;
    }
}