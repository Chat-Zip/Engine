import engine from "..";

export class ControlsElement extends HTMLElement {

    private top: HTMLDivElement;
    private down: HTMLDivElement;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const dir = document.createElement('div') as HTMLDivElement;
        dir.setAttribute('id', 'controls-dir');

        const forward = document.createElement('div') as HTMLDivElement;
        forward.setAttribute('class', 'controls-btn');
        forward.textContent = '▲';
        forward.ontouchstart = () => engine.controls?.movements.set('forward', true);
        forward.ontouchend = () => engine.controls?.movements.set('forward', false);

        const dirWrapper = document.createElement('div') as HTMLDivElement;
        dirWrapper.setAttribute('id', 'controls-dir-wrapper')

        const left = document.createElement('div') as HTMLDivElement;
        left.setAttribute('class', 'controls-btn');
        left.textContent = '◀';
        left.ontouchstart = () => engine.controls?.movements.set('left', true);
        left.ontouchend = () => engine.controls?.movements.set('left', false);

        const right = document.createElement('div') as HTMLDivElement;
        right.setAttribute('class', 'controls-btn');
        right.textContent = '▶';
        right.ontouchstart = () => engine.controls?.movements.set('right', true);
        right.ontouchend = () => engine.controls?.movements.set('right', false);

        dirWrapper.append(left, right);

        const back = document.createElement('div') as HTMLDivElement;
        back.setAttribute('class', 'controls-btn');
        back.textContent = '▼';
        back.ontouchstart = () => engine.controls?.movements.set('back', true);
        back.ontouchend = () => engine.controls?.movements.set('back', false);

        dir.append(forward, dirWrapper, back);

        const action = document.createElement('div') as HTMLDivElement;
        action.setAttribute('id', 'controls-action');
        
        this.top = document.createElement('div') as HTMLDivElement;
        this.top.setAttribute('class', 'controls-btn');
        this.top.textContent = '↑';
        this.top.ontouchstart = () => {
            if (this.hasAttribute('enable-editor')) engine.controls?.movements.set('top', true);
            else engine.controls?.movements.set('jump', true);
        }
        this.top.ontouchend = () => {
            if (this.hasAttribute('enable-editor')) engine.controls?.movements.set('top', false);
            else engine.controls?.movements.set('jump', false);
        }

        this.down = document.createElement('div') as HTMLDivElement;
        this.down.setAttribute('class', 'controls-btn');
        this.down.textContent = '↓';
        this.down.ontouchstart = () => engine.controls?.movements.set('down', true);
        this.down.ontouchend = () => engine.controls?.movements.set('down', false);

        action.append(this.top, this.down);

        const styleElem = document.createElement('style') as HTMLStyleElement;
        styleElem.textContent = `
        .controls-btn {
            color: #ffffff;
            background: #00000060;
            padding: 8px;
        }

        .hide {
            display: none;
        }

        #controls-dir {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            left: 0;
            bottom: 0;
            margin: 8px;
            z-index: 2;
        }

        #controls-dir-wrapper {
            display: flex;
            flex-direction: row;
            gap: 32px;
        }

        #controls-action {
            position: absolute;
            display: flex;
            flex-direction: column;
            right: 0;
            bottom: 0;
            margin: 8px;
            z-index: 2;
        }
        `;
        shadowRoot.append(dir, action, styleElem);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'enable-editor':
                if (this.hasAttribute(name)) this.down.classList.remove('hide');
                else this.down.classList.add('hide');
                break;
        }
    }

    static get observedAttributes() {
        return ['enable-editor'];
    }
}

customElements.define('chatzip-controls', ControlsElement);