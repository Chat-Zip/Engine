import { SelfState } from "../components/user/Self";

export default class Gravity {
    private state: SelfState;

    public isActive: boolean;

    constructor(state: SelfState) {
        this.state = state;
        this.isActive = true;
    }

    public update(delta: number) {
        const { state, isActive } = this
        if (!isActive) {
            if (state.gravAccel) state.gravAccel = 0;
            return;
        }
        return new Promise(resolve => {
            state.gravAccel -= state.gravity * delta;
            state.velocity[1] += state.gravAccel * delta;
            resolve(null);
        });
    }
}
