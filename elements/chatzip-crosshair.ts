import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from "lit";
import { customElement, query } from "lit/decorators.js";

import CROSS_HAIR from "../assets/crosshair.svg";

@customElement('chatzip-crosshair')
export class ChatZipCrossHair extends LitElement {

    @query('#crosshair') _crosshair!: HTMLImageElement;

    static styles?: CSSResultGroup = css`
        #crosshair {
            position: absolute;
            display: inline-block;
            width: 1em;
            height: 1em;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        }        
    `;

    constructor() {
        super();
    }

    protected render() {
        return html`
            <img id="crosshair" />
        `;
    }
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this._crosshair.src = CROSS_HAIR;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "chatzip-crosshair": ChatZipCrossHair;
    }
}