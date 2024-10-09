import { Euler, Vector3, Camera, EventDispatcher } from "three";
import Self from "../world/components/user/Self";

const _euler = new Euler(0, 0, 0, "YXZ");
const _vector = new Vector3();

const _PI_2 = Math.PI / 2;

export default class Controls extends EventDispatcher {
    private self: Self;
    private camera: Camera;
    private displacement: Vector3;
    
    public movements: Map<string, boolean>;
    public domElement: HTMLCanvasElement;
    public screenSpeed: number;

    constructor(self: Self ,domElement: HTMLCanvasElement) {
        super();
        this.movements = new Map([
            ['forward', false],
            ['back', false],
            ['left', false],
            ['right', false],
            ['top', false],
            ['down', false],
            ['jump', false],
        ]);
        this.self = self;
        this.camera = self.camera;
        this.displacement = new Vector3().fromArray(self.state.pos);

        this.domElement = domElement;
        this.screenSpeed = 1.0;
    }

    public moveCamera(movementX: number, movementY: number) {
        const { camera, screenSpeed } = this;
        _euler.setFromQuaternion(camera.quaternion);
        _euler.x -= movementY * 0.002 * screenSpeed;
        _euler.y -= movementX * 0.002 * screenSpeed;
        _euler.x = Math.max(-_PI_2, Math.min(_PI_2, _euler.x));
        camera.quaternion.setFromEuler(_euler);
    }

    public moveForward(distance: number) {
        const { camera, displacement } = this;
        _vector.setFromMatrixColumn(camera.matrix, 0);
        _vector.crossVectors(camera.up, _vector);
        displacement.addScaledVector(_vector, distance);
    }

    public moveRight(distance: number) {
        const { camera, displacement } = this;
        _vector.setFromMatrixColumn(camera.matrix, 0);
        displacement.addScaledVector(_vector, distance);
    }

    public disableMovement() {
        this.movements.forEach((_, key, map) => map.set(key, false));
    }

    public update(delta: number) {
        const state = this.self.state;
        const speed = state.speed * delta;
        const velocity = state.velocity;
        const { movements, displacement } = this;
        return new Promise(resolve => {
            displacement.fromArray(state.pos);
            if (movements.get('forward')) {
                this.moveForward(speed);
            }
            if (movements.get('back')) {
                this.moveForward(-speed);
            }
            if (movements.get('left')) {
                this.moveRight(-speed);
            }
            if (movements.get('right')) {
                this.moveRight(speed);
            }
            if (movements.get('top')) {
                displacement.y += speed;
            }
            if (movements.get('down')) {
                displacement.y -= speed;
            }
            if (movements.get('jump')) {
                if (state.onGround) {
                    state.gravAccel = state.jumpHeight;
                }
            }
            velocity[0] = displacement.x - state.pos[0]
            velocity[1] = displacement.y - state.pos[1]
            velocity[2] = displacement.z - state.pos[2]
            resolve(null);
        });
    }
}
