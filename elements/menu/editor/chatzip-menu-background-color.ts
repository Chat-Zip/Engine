import { Color } from "three";
import World from "../../../world";

export class MenuBackgroundColorElement extends HTMLDivElement {
    constructor(world: World) {
        super();
        const name = document.createElement('div') as HTMLDivElement;
        name.textContent = 'Background Color';

        const backgroundColorInput = document.createElement('input') as HTMLInputElement;
        backgroundColorInput.setAttribute('id', 'background-color');
        backgroundColorInput.setAttribute('type', 'color');
        backgroundColorInput.setAttribute('value', '#a2d3ff');
        backgroundColorInput.oninput = () => world.background = new Color(backgroundColorInput.value).convertLinearToSRGB();

        const styleElem = document.createElement('style') as HTMLStyleElement;
        styleElem.textContent = `
        #background-color {
            width: 48px;
            height: 48px;
            background-color: transparent;
            border: none;
        }
        `;

        this.append(name, backgroundColorInput, styleElem);
    }
}

customElements.define('chatzip-menu-background-color', MenuBackgroundColorElement, { extends: 'div' });