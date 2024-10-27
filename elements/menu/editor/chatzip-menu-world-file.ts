import { WorldLoadElement } from "../../chatzip-world-load";
import { WorldSaveElement } from "../../chatzip-world-save";


export class MenuWorldFileElement extends HTMLDivElement {
    constructor() {
        super();
        const pSave = document.createElement('div') as HTMLDivElement;
        pSave.textContent = 'Save';
        const worldSave = new WorldSaveElement();
        const pLoad = document.createElement('div') as HTMLDivElement;
        pLoad.textContent = 'Load';
        const worldLoad = new WorldLoadElement();
        this.append(pSave, worldSave, pLoad, worldLoad);
    }
}

customElements.define('chatzip-menu-world-file', MenuWorldFileElement,{extends: 'div'});