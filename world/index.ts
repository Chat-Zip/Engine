import { Scene } from "three";
import WorldMap from "./components/map";

export default class World extends Scene {
    public map: WorldMap;

    constructor() {
        super();
        this.map = new WorldMap(this);
    }
}
