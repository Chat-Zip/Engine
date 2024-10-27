import engine from "../..";

export class MenuWorldElement extends HTMLDivElement {
    constructor() {
        super();
        const title = document.createElement('p') as HTMLParagraphElement;
        title.textContent = '< World >';
        
        const goToSpawnPoint = document.createElement('button') as HTMLButtonElement;
        goToSpawnPoint.setAttribute('id', 'btn-goto-spawn-point');
        goToSpawnPoint.textContent = 'GO TO SPAWN POINT';
        goToSpawnPoint.onclick = () => engine.world.goToSpawn();

        this.append(
            title,
            goToSpawnPoint,
            document.createElement('hr')
        );
    }
}

customElements.define('chatzip-menu-world', MenuWorldElement, {extends: 'div'});