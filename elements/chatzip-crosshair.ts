import CROSS_HAIR from "../assets/crosshair.svg";

export class CrosshairElement extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const crossHair = document.createElement('img') as HTMLImageElement;
        crossHair.setAttribute('src', CROSS_HAIR);
        crossHair.setAttribute('id', 'crosshair');

        const styleElem = document.createElement('style') as HTMLStyleElement;
        styleElem.textContent = `
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
        shadowRoot.append(crossHair, styleElem);
    }
}

customElements.define('chatzip-crosshair', CrosshairElement);