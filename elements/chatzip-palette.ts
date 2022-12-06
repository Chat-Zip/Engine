import { css, CSSResultGroup, html, LitElement, PropertyValueMap } from 'lit'
import { customElement, query } from 'lit/decorators.js';

@customElement('chatzip-palette')
export class ChatZipPalette extends LitElement {

    static styles?: CSSResultGroup = css`
        #palette {
            position: absolute;
            left: 0;
            top: 0;
            margin-top: 1em;
            z-index: 1;
        }
        .palette-list {
            color: #ffffffaa;
            padding: 1em;
            font-size: larger;
            text-shadow: -1px 0 #000000aa, 0 1px #000000aa, 1px 0 #000000aa, 0 -1px #000000aa;
            border-style: none;
            border-color: #ffffffaa;
        }
        #eraser {
            color: #ff0000aa;
            padding: 1em;
            font-size: larger;
            text-shadow: -1px 0 #000000aa, 0 1px #000000aa, 1px 0 #000000aa, 0 -1px #000000aa;
            border-style: solid;
            border-color: #000000aa;
        }
        #color-board {
            display: none;
            margin-top: 2em;
            line-height: 0%;
        }
        #color-board span {
            display: inline-block;
            width: 2em;
            height: 2em;
        }
    `;

    constructor() {
        super();
    }

    protected render() {
        return html`
            <div id="palette">
                <span class="palette-list">1</span>
                <span class="palette-list">2</span>
                <span class="palette-list">3</span>
                <span class="palette-list">4</span>
                <span class="palette-list">5</span>
                <span class="palette-list">6</span>
                <span class="palette-list">7</span>
                <span class="palette-list">8</span>
                <span id="eraser"></span>
                <div id="color-board"></div>
            </div>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {

    }
}