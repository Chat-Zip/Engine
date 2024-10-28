import engine from "..";
import eventKeyListeners from '../controls/KeyEventListeners';

const UPDATE_COLOR_ITEMS = new Map<number, string>();

export class PaletteElement extends HTMLElement {
    private wrapper: HTMLDivElement;
    private paletteList: Array<HTMLSpanElement>;
    private eraser: HTMLSpanElement;
    private brush: HTMLDivElement;
    private brushVoxel: HTMLSpanElement;
    private brushBlock: HTMLSpanElement;
    private colorBoard: HTMLDivElement;
    private colorBoardItems: HTMLSpanElement[];
    private applyChange: HTMLButtonElement;
    private cancelChange: HTMLButtonElement;

    private styleElem: HTMLStyleElement;

    private selectColor(index: number) {
        const palette = engine.world.map.palette;
        // index : -1 => eraser / 0 ~ 7 -> list
        if (index < -1 || index > 7) {
            console.error('Out of index');
            return;
        }
        if (index === -1) {
            if (palette.selected === -1) return;
            this.eraser.classList.remove('eraser-inactive');
            this.eraser.classList.add('eraser-active');
            this.paletteList[palette.selected].classList.remove('list-item-active');
        }
        else {
            if (palette.selected === -1) {
                this.eraser.classList.remove('eraser-active');
                this.eraser.classList.add('eraser-inactive');
            }
            else {
                this.paletteList[palette.selected].classList.remove('list-item-active');
            }
            this.paletteList[index].classList.add('list-item-active');
        }
        palette.selected = index;
    }

    private selectBrush(brush: 'voxel' | 'block') {
        const editor = engine.world.editor;
        switch (brush) {
            case 'voxel':
                this.brushVoxel.classList.remove('brush-inactive');
                this.brushVoxel.classList.add('brush-active');
                this.brushBlock.classList.remove('brush-active');
                this.brushBlock.classList.add('brush-inactive');
                break;
            case 'block':
                this.brushVoxel.classList.remove('brush-active');
                this.brushVoxel.classList.add('brush-inactive');
                this.brushBlock.classList.remove('brush-inactive');
                this.brushBlock.classList.add('brush-active');
                break;
        }
        editor.setBrush(brush);
    }

    private reloadColors(target: 'all' | 'list') {
        const palette = engine.world.map.palette;
        if (target === 'all') {
            // reload colors
            for (let i = 0, j = 64; i < j; i++) {
                this.colorBoardItems[i].style.background = palette.colors[i + 1];
            }
        }
        // reload palette list
        for (let i = 0, j = 8; i < j; i++) {
            this.paletteList[i].style.background = palette.colors[palette.list[i]]
        }
    }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        const worldMap = engine.world.map;
        const palette = worldMap.palette;

        // palette
        this.wrapper = document.createElement('div') as HTMLDivElement;
        this.wrapper.setAttribute('id', 'palette');

        // palette list
        this.paletteList = new Array<HTMLSpanElement>();
        for (let i = 0, j = 8; i < j; i++) {
            this.paletteList[i] = document.createElement('span') as HTMLSpanElement;
            this.paletteList[i].setAttribute('class', 'palette-list');
            this.paletteList[i].textContent = `${i + 1}`;
            this.paletteList[i].style.background = palette.colors[palette.list[i]];
            this.paletteList[i].onclick = () => {
                if (palette.selected === i) {
                    this.colorBoard.classList.toggle('hide');
                    this.colorBoard.classList.toggle('d-grid');
                }
                else {
                    this.colorBoard.classList.remove('hide');
                    this.colorBoard.classList.add('d-grid');
                }
                this.selectColor(i);
            }
        }

        //eraser
        this.eraser = document.createElement('span') as HTMLSpanElement;
        this.eraser.setAttribute('class', 'palette-list');
        this.eraser.setAttribute('id', 'eraser');
        this.eraser.textContent = 'X';
        this.eraser.onclick = () => {
            this.selectColor(-1);
            this.colorBoard.classList.remove('d-grid');
            this.colorBoard.classList.add('hide');
        }

        // brush
        this.brush = document.createElement('div') as HTMLDivElement;
        this.brush.setAttribute('id', 'brush');
        this.brushVoxel = document.createElement('span') as HTMLSpanElement;
        this.brushVoxel.setAttribute('id', 'brush-v');
        this.brushVoxel.setAttribute('class', 'brush-items');
        this.brushVoxel.textContent = 'VOXEL(V)';
        this.brushBlock = document.createElement('span') as HTMLSpanElement;
        this.brushBlock.setAttribute('id', 'brush-b');
        this.brushBlock.setAttribute('class', 'brush-items');
        this.brushBlock.textContent = 'BLOCK(B)';

        // color board
        this.colorBoard = document.createElement('div') as HTMLDivElement;
        this.colorBoard.setAttribute('id', 'color-board');
        this.colorBoard.setAttribute('class', 'hide');
        this.colorBoardItems = [];
        for (let i = 0, j = 64; i < j; i++) {
            const colorIndex = i + 1; // colorIndex 0 => empty / 1 ~ 64 => colors

            const colorItem = document.createElement('span') as HTMLSpanElement;
            colorItem.setAttribute('id', `c${i}`);
            colorItem.style.backgroundColor = palette.colors[colorIndex];

            const colorInput = document.createElement('input') as HTMLInputElement;
            colorInput.setAttribute('type', 'color');
            colorInput.setAttribute('id', 'color-board-input');
            colorInput.addEventListener('change', () => {
                colorItem.style.backgroundColor = colorInput.value;
                UPDATE_COLOR_ITEMS.set(i, colorInput.value);
                if (this.applyChange.classList.contains('hide')) this.applyChange.classList.remove('hide');
                if (this.cancelChange.classList.contains('hide')) this.cancelChange.classList.remove('hide');
            });

            colorItem.addEventListener('click', (e) => {
                if (!e.isTrusted) return;
                if (palette.selected === -1) return;
                palette.list[palette.selected] = colorIndex;
                this.paletteList[palette.selected].style.backgroundColor = palette.colors[colorIndex];
                this.colorBoard.classList.remove('d-grid');
                this.colorBoard.classList.add('hide');
            });
            colorItem.addEventListener('contextmenu', e => {
                e.preventDefault();
                colorInput.click();
            });
            this.colorBoardItems.push(colorItem);
            this.colorBoard.appendChild(colorItem);
        }

        // apply or cancel change (color board)
        this.applyChange = document.createElement('button') as HTMLButtonElement;
        this.applyChange.setAttribute('id', 'apply-change');
        this.applyChange.setAttribute('class', 'hide btn-apply');
        this.applyChange.textContent = 'APPLY COLOR CHANGE';
        this.applyChange.addEventListener('click', () => {
            UPDATE_COLOR_ITEMS.forEach((color, idx) => {
                palette.colors[idx + 1] = color;
            });
            worldMap.reloadChunks();
            this.reloadColors('list');
            this.applyChange.classList.add('hide');
            this.cancelChange.classList.add('hide');
        });
        this.cancelChange = document.createElement('button') as HTMLButtonElement;
        this.cancelChange.setAttribute('id', 'cancel-change');
        this.cancelChange.setAttribute('class', 'hide btn-apply');
        this.cancelChange.textContent = 'CANCEL';
        this.cancelChange.addEventListener('click', () => {
            UPDATE_COLOR_ITEMS.forEach((color, idx) => {
                this.colorBoardItems[idx].style.backgroundColor = palette.colors[idx + 1];
            });
            UPDATE_COLOR_ITEMS.clear();
            this.applyChange.classList.add('hide');
            this.cancelChange.classList.add('hide');
        })

        this.brush.append(this.brushVoxel, this.brushBlock);
        this.wrapper.append(...this.paletteList, this.eraser, this.brush, this.colorBoard, this.applyChange, this.cancelChange);

        this.styleElem = document.createElement('style') as HTMLStyleElement;
        this.styleElem.textContent = `
        #palette {
            position: absolute;
            left: 1rem;
            top: 1rem;
            z-index: 1;
        }
        .palette-list {
            border: none;
            color: #ffffff77;
            font-weight: bold;
            -webkit-text-stroke: 1px black;
            text-stroke: 1px black;
            text-align: center;
            border-radius: 32px;
            font-size: medium;
            border-style: none;
            border-color: #fffffff0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 32px;
            height: 32px;
            margin: 0 2px 0 2px;
        }
        #eraser {
            color: #ff0000aa;
            border-style: solid;
            border-width: 2px;
        }
        #brush {
            font-weight: bold;
            font-size: medium;
            margin: 8px;
        }
        #color-board {
            line-height: 0%;
            grid-template-columns: repeat(8, 32px);
            grid-template-rows: repeat(8, 32px);
        }
        #color-board span {
            display: inline-block;
            cursor: pointer;
            // width: 2em;
            // height: 2em;
        }
        #color-board span label {
            width: 100%;
            height: 100%;
        }
        #color-board-input {
            display: none;
        }
        #apply-change {
            color: #fff;
            background: #00ad3aa0;
        }
        #apply-change:hover {
            background: #00ad3a;
        }
        #cancel-change {
            background: #d73c22a0;
        }
        #cancel-change:hover {
            background: #d73c22;
        }
        .hide {
            display: none;
        }
        .d-grid {
            display: grid;
        }
        .d-block {
            display: block;
        }
        .d-inline-block {
            display: inline-block;
        }
        .list-item-active {
            border: solid;
            color: #ffffff;
        }
        .eraser-active {
            text-shadow: -1px 0 #ffffffaa, 0 1px #ffffffaa, 1px 0 #ffffffaa, 0 -1px #ffffffaa;
            border-color: #fffffff0;
        }
        .eraser-inactive {
            text-shadow: -1px 0 #000000aa, 0 1px #000000aa, 1px 0 #000000aa, 0 -1px #000000aa;
            border-color: #000000aa;
        }
        .brush-items {
            padding: 4px;
            margin: 0 4px 0 0;
            border-radius: 32px;
            border-color: #00000080;
        }
        .brush-active {
            background: #ffffffc0;
            border: solid;
        }
        .brush-inactive {
            background: #ffffff40;
            border: none;
        }
        .btn-apply {
            font-family: "Galmuri11", sans-serif;
            font-weight: bold;
            padding: 8px;
            margin: 4px;
            border-radius: 32px;
            border: none;
        }
        `;

        shadowRoot.append(this.wrapper, this.styleElem);
    }

    connectedCallback() {
        requestAnimationFrame(() => this.mounted());
    }

    private setEnable(enable: boolean) {
        const uiKey = eventKeyListeners.ui;
        if (enable) {
            uiKey.set('Digit1', () => this.selectColor(0));
            uiKey.set('Digit2', () => this.selectColor(1));
            uiKey.set('Digit3', () => this.selectColor(2));
            uiKey.set('Digit4', () => this.selectColor(3));
            uiKey.set('Digit5', () => this.selectColor(4));
            uiKey.set('Digit6', () => this.selectColor(5));
            uiKey.set('Digit7', () => this.selectColor(6));
            uiKey.set('Digit8', () => this.selectColor(7));
            uiKey.set('KeyX', () => this.selectColor(-1));
            uiKey.set('KeyV', () => this.selectBrush('voxel'));
            uiKey.set('KeyB', () => this.selectBrush('block'));

            this.selectColor(0);
            this.eraser.classList.add('eraser-inactive');
            this.brushVoxel.classList.add('brush-active');
            this.brushBlock.classList.add('brush-inactive');

            this.wrapper.classList.remove('hide');
        }
        else {
            uiKey.delete('Digit1');
            uiKey.delete('Digit2');
            uiKey.delete('Digit3');
            uiKey.delete('Digit4');
            uiKey.delete('Digit5');
            uiKey.delete('Digit6');
            uiKey.delete('Digit7');
            uiKey.delete('Digit8');
            uiKey.delete('KeyX');
            uiKey.delete('KeyV');
            uiKey.delete('KeyB');

            this.wrapper.classList.add('hide');
        }
    }

    private mounted() {
        this.setEnable(this.hasAttribute('enable-editor'));
        engine.addEventListener('change-editor-mode', (e) => {
            if (e.enable) this.setAttribute('enable-editor', '');
            else this.removeAttribute('enable-editor');
        });
        engine.addEventListener('world-loaded', () => this.reloadColors('all'));
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'enable-editor':
                // if (this.hasAttribute(name)) this.wrapper.classList.remove('hide');
                // else this.wrapper.classList.add('hide');
                this.setEnable(this.hasAttribute(name));
                break;
        }
    }

    static get observedAttributes() {
        return ['enable-editor'];
    }
}

customElements.define('chatzip-palette', PaletteElement);