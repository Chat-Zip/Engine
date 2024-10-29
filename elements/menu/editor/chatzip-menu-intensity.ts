import World from "../../../world";

export class MenuIntensityElement extends HTMLDivElement {
    constructor(world: World) {
        super();
        const name = document.createElement('div') as HTMLDivElement;
        name.textContent = 'Intensity';

        const intensityInput = document.createElement('input') as HTMLInputElement;
        intensityInput.setAttribute('id', 'intensity');
        intensityInput.setAttribute('type', 'number');
        intensityInput.setAttribute('value', `${world.light.intensity}`);
        intensityInput.setAttribute('min', '0');
        intensityInput.setAttribute('step', 'any');
        intensityInput.oninput = () => {
            const value = Number(intensityInput.value);
            world.light.intensity = value;
        }
        intensityInput.onfocus = () => intensityInput.value = `${world.light.intensity}`;

        const intensityDefault = document.createElement('button') as HTMLButtonElement;
        intensityDefault.textContent = 'SET DEFAULT';
        intensityDefault.onclick = () => {
            world.light.intensity = Math.PI;
            intensityInput.value = `${Math.PI}`;
        }

        this.append(name, intensityInput, intensityDefault);
    }
}

customElements.define('chatzip-menu-intensity', MenuIntensityElement, {extends: 'div'});