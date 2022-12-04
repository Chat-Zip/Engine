import { LitElement, html, css, PropertyValueMap, CSSResultGroup } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import engine from '..';

@customElement('chatzip-world-file-manager')
export class ChatZipWorldFileManager extends LitElement {

    @query('#load') _load?: HTMLInputElement;

    static styles?: CSSResultGroup = css`
        #file-manager {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1;
        }
    `;

    constructor() {
        super();
    }

    protected render() {
        return html`
            <div id="file-manager">
                <input id="load" type="file" accept=".zip">
            </div>
        `;   
    }
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const world = engine.world;
        const { _load } = this;
        _load?.addEventListener('input', () => {
            const file = _load?.files?.[0];
            if (!file) return;
            world.load(file).then(() => {
                const spawnPoint = world.data.spawnPoint;
                const selfPos = world.self.state.pos;
                selfPos[0] = spawnPoint[0];
                selfPos[1] = spawnPoint[1];
                selfPos[2] = spawnPoint[2];
            });
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "chatzip-world-file-manager": ChatZipWorldFileManager;
    }
}