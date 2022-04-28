import { Texture, TextureLoader, SpriteMaterial, Sprite } from 'three';

export default class UserAppearance extends Sprite {
    map: Texture;

    constructor() {
        const map = new TextureLoader().load('./person.png');
        const material = new SpriteMaterial({map: map});
        super(material);
        this.position.y = 6;
        this.scale.set(18, 18, 18);
        this.map = map;
        this.material = material;
    }
    dispose() {
        this.map.dispose();
        this.material.dispose();
    }
}