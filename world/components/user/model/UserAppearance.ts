import { Texture, TextureLoader, SpriteMaterial, Sprite, NearestFilter } from 'three';

export default class UserAppearance extends Sprite {
    map: Texture;

    constructor() {
        const map = new TextureLoader().load('./person.png');
        map.magFilter = NearestFilter;
        const material = new SpriteMaterial({map: map});
        super(material);
        this.position.y = 8;
        this.scale.set(16, 16, 1);
        this.map = map;
        this.material = material;
    }
    dispose() {
        this.map.dispose();
        this.material.dispose();
    }
}