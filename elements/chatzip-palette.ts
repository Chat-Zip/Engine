import { css, CSSResultGroup, html, LitElement, PropertyValueMap } from 'lit'
import { customElement, query, queryAll } from 'lit/decorators.js';
import engine from '..';
import eventKeyListeners from '../controls/KeyEventListeners';

@customElement('chatzip-palette')
export class ChatZipPalette extends LitElement {

    private _colorBoard: HTMLDivElement;
    @query('#palette') _palette!: HTMLDivElement;
    @queryAll('.palette-list') _list!: HTMLCollectionOf<HTMLSpanElement>;
    @query('#eraser') _eraser!: HTMLSpanElement;
    @query('#brush-v') _brush_voxel!: HTMLSpanElement;
    @query('#brush-b') _brush_block!: HTMLSpanElement;

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
            text-align: center;
            border-radius: 32px;
            font-size: larger;
            border-style: none;
            border-color: #fffffff0;
            display: inline-block;
            width: 32px;
            height: 32px;
        }
        #eraser {
            color: #ff0000aa;
            border-style: solid;
            border-color: #000000aa;
            border-width: 2px;
        }
        #brush {
            font-weight: bold;
            font-size: medium;
            margin: 8px;
        }
        #brush > span {
            background: #ffffffaa;
            padding: 4px;
            margin: 0 4px 0 0;
            border-radius: 32px;
            border-color: #00000080;
        }
        #color-board {
            display: none;
            line-height: 0%;
            grid-template-columns: repeat(8, 32px);
            grid-template-rows: repeat(8, 32px);
        }
        #color-board span {
            display: inline-block;
            // width: 2em;
            // height: 2em;
        }
    `;

    constructor() {
        super();
        this._colorBoard = document.createElement('div') as HTMLDivElement;
        this._colorBoard.id = 'color-board';
        const palette = engine.world.map.palette;
        for (let i = 1; i < 65 ; i++) {
            const color = document.createElement('span') as HTMLSpanElement;
            color.style.backgroundColor = palette.colors[i];
            color.addEventListener('click', () => {
                palette.list[palette.selected] = i;
                this._list[palette.selected].style.backgroundColor = palette.colors[i];
                this._colorBoard.style.display = 'none';
            });
            this._colorBoard.appendChild(color);
            // if (i % 8 === 0) this._colorBoard.appendChild(document.createElement('br'));
        }
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
                <div id="brush">
                    <span id="brush-v">VOXEL(V)</span>
                    <span id="brush-b">BLOCK(B)</span>
                </div>
            </div>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const palette = engine.world.map.palette;
        const editor = engine.world.editor;
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

        const selectBrush = (brush: 'voxel' | 'block') => {
            switch(brush) {
                case 'voxel':
                    this._brush_voxel.style.background = "#ffffffc0";
                    this._brush_block.style.background = "#ffffff40";
                    this._brush_voxel.style.border = "solid";
                    this._brush_block.style.border = "none";
                    break;
                case 'block':
                    this._brush_voxel.style.background = "#ffffff40";
                    this._brush_block.style.background = "#ffffffc0";
                    this._brush_voxel.style.border = "none";
                    this._brush_block.style.border = "solid";
                    break;
            }
            editor.setBrush(brush);
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
        uiKey.set('KeyV', () => selectBrush('voxel'));
        uiKey.set('KeyB', () => selectBrush('block'));

        this._palette.appendChild(this._colorBoard);
        for (let i = 0, j = this._list.length; i < j; i++) {
            const colorItem = this._list[i];
            colorItem.style.background = palette.colors[palette.list[i]];
            colorItem.addEventListener('click', () => {
                selectColor(i);
                palette.selected = i;
                this._colorBoard.style.display = 'grid';
            });
        }

        selectBrush('voxel');
    }
}