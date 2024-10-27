import World from "../../../world";

export class MenuSpawnElement extends HTMLDivElement {
    constructor(world: World) {
        super();
        const name = document.createElement('div') as HTMLDivElement;
        name.textContent = 'Spawn';

        const setSpawnPoint = document.createElement('button') as HTMLButtonElement;
        setSpawnPoint.setAttribute('id', 'btn-set-spawn-point');
        setSpawnPoint.textContent = 'CURRENT LOCATION AS SPAWN';
        setSpawnPoint.onclick = () => world.setSpawnPoint();

        this.append(name, setSpawnPoint);
    }
}

customElements.define('chatzip-menu-spawn', MenuSpawnElement, {extends: 'div'});