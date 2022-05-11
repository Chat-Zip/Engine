import { SelfState } from "../components/user/Self";

export default class Gravity {
    private velovity: Array<number>;
    private gravity: number;
    private gravAccel: number;

    public isActive: boolean;

    constructor(state: SelfState) {
        this.velovity = state.velocity;
        this.gravity = state.gravity;
        this.gravAccel = state.gravAccel;

        this.isActive = true;
    }

    public update(delta: number) {
        if (!this.isActive) return;
        const { velovity, gravity, gravAccel } = this;
        this.gravAccel -= gravity * delta;
        velovity[1] += gravAccel * delta;
    }
}