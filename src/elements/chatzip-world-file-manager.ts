import { LitElement, html, css, PropertyValueMap, CSSResultGroup } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import engine from '..';

@customElement('chatzip-world-file-manager')
export class ChatZipWorldFileManager extends LitElement {

    @query('#world-name') _worldName?: HTMLInputElement;
    @query('#save') _save?: HTMLButtonElement;
    @query('#load') _load?: HTMLInputElement;

    static styles?: CSSResultGroup = css`
        #file-manager {
            display: flex;
            flex-direction: column;
        }
    `;

    constructor() {
        super();
    }

    protected render() {
        return html`
            <div id="file-manager">
                <input id="world-name" type="text" size="16">
                <button id="save">save</button>
                <input id="load" type="file" accept=".zip">
            </div>
        `;   
    }
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const world = engine.world;
        const { _load, _save, _worldName } = this;
        _worldName?.addEventListener('input', () => {
            let maxLength = 32;
            const content = _worldName.value;
            for (let i = 0, j = content.length; i < j; i++) {
                if (content.charCodeAt(i) > 255) {
                    maxLength = 16;
                    break;
                }
            }
            if (content.length > maxLength) {
                _worldName.value = content.substr(0, maxLength)
            }
        });
        _save?.addEventListener('click', () => world.save(_worldName!.value));
        _load?.addEventListener('input', () => {
            const file = _load?.files?.[0];
            if (!file) return;
            world.load(file).then(() => {
                const spawnPoint = world.data.spawnPoint;
                const selfPos = world.self.state.pos;
                selfPos[0] = spawnPoint[0] ? spawnPoint[0] : 0;
                selfPos[1] = spawnPoint[1] ? spawnPoint[1] : 1;
                selfPos[2] = spawnPoint[2] ? spawnPoint[2] : 2;
            });
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "chatzip-world-file-manager": ChatZipWorldFileManager;
    }
}