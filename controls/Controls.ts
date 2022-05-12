import { Euler, Vector3, Camera, EventDispatcher } from "three";
import { Peers } from "../connection/Peer";
import Self from "../world/components/user/Self";

const _euler = new Euler(0, 0, 0, "YXZ");
const _vector = new Vector3();

const _PI_2 = Math.PI / 2;

const _prevMoveBuffer = new ArrayBuffer(12),
    _currentMoveBuffer = new ArrayBuffer(12),
    _prevMoveArray = new Float32Array(_prevMoveBuffer),
    _currentMoveArray = new Float32Array(_currentMoveBuffer);

function _isMove() {
    for (let i = 0; i < 3; i++) {
        if (_prevMoveArray[i] !== _currentMoveArray[i]) {
            return true;
        }
    }
    return false;
}

export default class Controls extends EventDispatcher {
    private self: Self;
    private camera: Camera;
    private peers: Peers;
    private displacement: Vector3;
    
    public movements: Map<string, boolean>;
    public domElement: HTMLCanvasElement;
    public screenSpeed: number;

    constructor(self: Self ,domElement: HTMLCanvasElement, peers: Peers) {
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
        this.peers = peers;
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

    public getVelocity(delta: number) {
        const state = this.self.state;
        const speed = state.speed * delta;
        const { movements, displacement } = this;
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
        // Return velocity
        return [
            displacement.x - state.pos[0],
            displacement.y - state.pos[1],
            displacement.z - state.pos[2],
        ]
    }

    public tick() {
        _prevMoveArray.set(_currentMoveArray);
        _currentMoveArray.set(this.self.state.pos);

        if (!_isMove()) return;

        const peers = Array.from(this.peers.values());
        for (let i = 0, j = peers.length; i < j; i++) {
            peers[i].sendMovement(_currentMoveBuffer);
        }
    }
}
