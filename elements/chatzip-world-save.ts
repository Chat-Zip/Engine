import engine from "..";

export class WorldSaveElement extends HTMLDivElement {
    constructor() {
        super();
        const inputWorldName = document.createElement('input') as HTMLInputElement;
        inputWorldName.setAttribute('type', 'text');
        inputWorldName.setAttribute('placeholder', 'Type world name');
        inputWorldName.setAttribute('size', '16');
        inputWorldName.addEventListener('input', () => {
            let maxLength = 32;
            const content = inputWorldName.value;
            for (let i = 0, j = content.length; i < j; i++) {
                if (content.charCodeAt(i) > 255) {
                    maxLength = 16;
                    break;
                }
            }
            if (content.length > maxLength) {
                inputWorldName.value = content.substring(0, maxLength)
            }
        });

        const btnSave = document.createElement('button') as HTMLButtonElement;
        btnSave.textContent = 'save';
        btnSave.addEventListener('click', () => engine.world.save(inputWorldName.value));

        this.append(inputWorldName, btnSave);
    }
}

customElements.define('chatzip-world-save', WorldSaveElement, {extends: 'div'});