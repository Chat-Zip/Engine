import engine from "../..";

export class MenuDisplayElement extends HTMLDivElement {
    constructor() {
        super();
        const title = document.createElement('p') as HTMLParagraphElement;
        title.textContent = '< Display >';

        const fullScreen = document.createElement('button') as HTMLButtonElement;
        fullScreen.setAttribute('id', 'btn-fullscreen');
        fullScreen.textContent = 'ENTER FULLSCREEN';
        fullScreen.onclick = () => engine.setFullScreen(!engine.fullScreenMode);
        engine.addEventListener('fullscreen-mode', (e) => fullScreen.textContent = e.active ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN');

        this.append(
            title,
            fullScreen,
            document.createElement('hr')
        );
    }
}

customElements.define('chatzip-menu-display', MenuDisplayElement, {extends: 'div'});