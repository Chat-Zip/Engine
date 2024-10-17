import { CanvasTexture, SpriteMaterial, Sprite, NearestFilter } from 'three';

function makeLabelCanvas(name: string) {
    const borderSize = 1;
    const fontSize = 16;
    const font = `${fontSize}px bold sans-serif`;
    const context = document.createElement('canvas').getContext('2d');
    context.font = font;
    const nameWidth = context.measureText(name).width;

    const doubleBorderSize = borderSize * 2;
    const width = nameWidth + doubleBorderSize;
    const height = fontSize + doubleBorderSize;

    context.canvas.width = width;
    context.canvas.height= height;

    context.font = font;
    context.textAlign = 'center';
    context.fillStyle = '#00000060';
    context.fillRect(0, 0, width, height);
    context.translate(width / 2, height / 2);
    context.fillStyle = 'white';
    context.fillText(name, 0, fontSize / 4);

    return context.canvas;
}

export default class NameLabel extends Sprite {
    map: CanvasTexture;

    constructor(name: string) {
        const canvas = makeLabelCanvas(name);
        const map = new CanvasTexture(canvas);
        map.magFilter = NearestFilter;
        const material = new SpriteMaterial({
            map: map,
            transparent: true
        });

        super(material);
        this.map = map;
        this.material = material;
        this.scale.x = canvas.width * 0.1;
        this.scale.y = canvas.height * 0.1;
        this.position.y = 18;
    }
    dispose() {
        this.map.dispose();
        this.material.dispose();
    }
}