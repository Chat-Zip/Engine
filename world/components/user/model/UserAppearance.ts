import { Texture, TextureLoader, PlaneGeometry, MeshBasicMaterial, Mesh, NearestFilter, Plane } from 'three';

export default class UserAppearance extends Mesh {
    private map: Texture;

    constructor() {
        const map = new TextureLoader().load('./person.png');
        map.magFilter = NearestFilter;
        const plane = new PlaneGeometry(16, 16);
        const material = new MeshBasicMaterial({map: map, alphaTest: 0.5});
        super(plane, material);
        this.map = map;
        this.position.y += 8;
    }
    dispose() {
        this.map.dispose();
        this.geometry.dispose();
    }
}