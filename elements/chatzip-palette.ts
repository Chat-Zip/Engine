import { css, CSSResultGroup, html, LitElement, PropertyValueMap } from 'lit'
import { customElement, query, queryAll } from 'lit/decorators.js';
import engine from '..';
import eventKeyListeners from '../controls/KeyEventListeners';

@customElement('chatzip-palette')
export class ChatZipPalette extends LitElement {

    @queryAll('.palette-list') _list!: HTMLCollectionOf<HTMLSpanElement>;
    @query('#eraser') _eraser!: HTMLSpanElement;
    @query('#color-board') _colorBoard!: HTMLDivElement;

    static styles?: CSSResultGroup = css`
        #palette {
            font-family: sans-serif;
            position: absolute;
            display: inline-block;
            left: 1rem;
            top: 2rem;
            z-index: 1;
        }
        .palette-list {
            color: #ffffff77;
            font-weight: bold;
            -webkit-text-stroke: 1px black;
            text-stroke: 1px black;
            border-radius: 32px;
            padding: 8px;
            font-size: larger;
            border-style: none;
            border-color: #fffffff0;
        }
        #eraser {
            color: #ff0000aa;
            border-style: solid;
            border-color: #000000aa;
            border-width: 2px;
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
                <span class="palette-list" id="eraser">X</span>
                <div id="color-board"></div>
            </div>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const palette = engine.world.map.palette;
        const uiKey = eventKeyListeners.ui;
        const selectColor = (index: number) => {
            const { _list } = this;
            // index : -1 => eraser / 0 ~ 7 -> list
            if (index < -1 || index > 7) {
                console.error('Out of index');
                return;
            }
            if (index === -1) {
                if (palette.selected === -1) return;
                this._eraser.style.textShadow = '-1px 0 #ffffffaa, 0 1px #ffffffaa, 1px 0 #ffffffaa, 0 -1px #ffffffaa';
                this._eraser.style.borderColor = '#fffffff0';
                _list[palette.selected].style.border = 'none';
                _list[palette.selected].style.color = '#ffffff77';
            }
            else {
                if (palette.selected === -1) {
                    this._eraser.style.textShadow = '-1px 0 #000000aa, 0 1px #000000aa, 1px 0 #000000aa, 0 -1px #000000aa';
                    this._eraser.style.borderColor = '#000000aa';
                }
                else {
                    _list[palette.selected].style.border = 'none';
                    _list[palette.selected].style.color = '#ffffff77';
                }
                _list[index].style.border = 'solid';
                _list[index].style.color = '#ffffff';
            }
            palette.selected = index;
        }
        uiKey.set('Digit1', () => selectColor(0));
        uiKey.set('Digit2', () => selectColor(1));
        uiKey.set('Digit3', () => selectColor(2));
        uiKey.set('Digit4', () => selectColor(3));
        uiKey.set('Digit5', () => selectColor(4));
        uiKey.set('Digit6', () => selectColor(5));
        uiKey.set('Digit7', () => selectColor(6));
        uiKey.set('Digit8', () => selectColor(7));
        uiKey.set('KeyX', () => selectColor(-1));

        for (let i = 0, j = this._list.length; i < j; i++) {
            const colorItem = this._list[i];
            colorItem.style.background = palette.colors[palette.list[i]];
            colorItem.addEventListener('click', () => {
                selectColor(i);
                palette.selected = i;
                this._colorBoard.style.display = 'block';
            });
        }

        for (let i = 1; i < 65 ; i++) {
            const color = document.createElement('span') as HTMLSpanElement;
            color.style.backgroundColor = palette.colors[i];
            color.addEventListener('click', () => {
                palette.list[palette.selected] = i;
                this._list[palette.selected].style.backgroundColor = palette.colors[i];
                this._colorBoard.style.display = 'none';
            });
            this._colorBoard.appendChild(color);
            if (i % 8 === 0) this._colorBoard.appendChild(document.createElement('br'));
        }
    }
}