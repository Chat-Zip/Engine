import engine from "..";

export class WorldLoadElement extends HTMLDivElement {
    constructor() {
        super();

        const buttonLoad = document.createElement('button') as HTMLButtonElement;
        const labelLoad = document.createElement('label') as HTMLLabelElement;
        labelLoad.setAttribute('id', 'label-file-load');
        labelLoad.setAttribute('for', 'input-file-load');
        labelLoad.textContent = 'SELECT WORLD FILE';
        buttonLoad.appendChild(labelLoad);

        const inputLoad = document.createElement('input') as HTMLInputElement;
        inputLoad.setAttribute('id', 'input-file-load');
        inputLoad.setAttribute('type', 'file');
        inputLoad.setAttribute('accept', '.zip');
        inputLoad.addEventListener('input', () => {
            const file = inputLoad.files?.[0];
            if (!file) return;
            engine.world.load(file).then(() => {
                const spawnPoint = engine.world.spawnPoint;
                const selfPos = engine.world.self.state.pos;
                selfPos[0] = spawnPoint[0] ? spawnPoint[0] : 0;
                selfPos[1] = spawnPoint[1] ? spawnPoint[1] : 0;
                selfPos[2] = spawnPoint[2] ? spawnPoint[2] : 0;
            });
        });

        const styleElem = document.createElement('style') as HTMLStyleElement;
        styleElem.textContent = `
        #label-file-load {
            padding: 4px;
        }
        #input-file-load {
            display: none;
        }
        `;
        this.append(buttonLoad, inputLoad, styleElem);
    }
}

customElements.define('chatzip-world-load', WorldLoadElement, { extends: 'div' });