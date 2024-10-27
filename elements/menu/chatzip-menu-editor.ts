import engine from '../..';
import { MenuWorldFileElement } from './editor/chatzip-menu-world-file';
import { MenuIntensityElement } from './editor/chatzip-menu-intensity';
import { MenuBackgroundColorElement } from './editor/chatzip-menu-background-color';
import { MenuSpawnElement } from './editor/chatzip-menu-spawn';

export class MenuEditorElement extends HTMLDivElement {
    constructor() {
        super();
        const world = engine.world;

        const title = document.createElement('p') as HTMLParagraphElement;
        title.textContent = '< Editor >';

        const intensityElem = new MenuIntensityElement(world);
        const backgroundColorElem = new MenuBackgroundColorElement(world);
        const worldFileElem = new MenuWorldFileElement();
        const spawnElem = new MenuSpawnElement(world);

        this.append(
            title,
            intensityElem,
            backgroundColorElem,
            spawnElem,
            worldFileElem,
            document.createElement('hr')
        );
    }
}

customElements.define('chatzip-menu-editor', MenuEditorElement, {extends: 'div'});