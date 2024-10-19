import engine from '..';

export class WorldFileManagerElement extends HTMLElement {
    private wrapper: HTMLDivElement;
    private inputWorldName: HTMLInputElement;
    private btnSave: HTMLButtonElement;
    private inputLoad: HTMLInputElement;
    private styleElem: HTMLStyleElement;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        this.wrapper = document.createElement('div') as HTMLDivElement;
        this.wrapper.setAttribute('id', 'file-manager');

        this.inputWorldName = document.createElement('input') as HTMLInputElement;
        this.inputWorldName.setAttribute('type', 'text');
        this.inputWorldName.setAttribute('size', '16');
        this.inputWorldName.addEventListener('input', () => {
            let maxLength = 32;
            const content = this.inputWorldName.value;
            for (let i = 0, j = content.length; i < j; i++) {
                if (content.charCodeAt(i) > 255) {
                    maxLength = 16;
                    break;
                }
            }
            if (content.length > maxLength) {
                this.inputWorldName.value = content.substring(0, maxLength)
            }
        });
        this.wrapper.appendChild(this.inputWorldName);

        this.btnSave = document.createElement('button') as HTMLButtonElement;
        this.btnSave.textContent = 'save';
        this.btnSave.addEventListener('click', () => engine.world.save(this.inputWorldName.value));
        this.wrapper.appendChild(this.btnSave);

        this.inputLoad = document.createElement('input') as HTMLInputElement;
        this.inputLoad.setAttribute('type', 'file');
        this.inputLoad.setAttribute('accept', '.zip');
        this.inputLoad.addEventListener('input', () => {
            const file = this.inputLoad?.files?.[0];
            if (!file) return;
            engine.world.load(file).then(() => {
                const spawnPoint = engine.world.data.spawnPoint;
                const selfPos = engine.world.self.state.pos;
                selfPos[0] = spawnPoint[0] ? spawnPoint[0] : 0;
                selfPos[1] = spawnPoint[1] ? spawnPoint[1] : 1;
                selfPos[2] = spawnPoint[2] ? spawnPoint[2] : 2;
            });
        });
        this.wrapper.appendChild(this.inputLoad);

        this.styleElem = document.createElement('style') as HTMLStyleElement;
        this.styleElem.textContent = `
            #file-manager {
                display: flex;
                flex-direction: column;
            }
        `;

        shadowRoot.append(this.wrapper, this.styleElem);
    }
}

customElements.define('chatzip-world-file-manager', WorldFileManagerElement);