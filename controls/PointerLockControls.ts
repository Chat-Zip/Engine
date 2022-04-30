import { Euler, EventDispatcher, Vector3, Camera } from "three";
import Self from "../world/components/user/Self";

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

export default class PointerLockControls extends EventDispatcher {
    private keys: Map<string, boolean>;
    camera: Camera;
    displacement: Vector3;
    domElement: HTMLCanvasElement;
    isLocked: boolean;
    pointerSpeed: number;

    constructor(self: Self, domElement: HTMLCanvasElement) {
        super();
        this.keys = new Map([
            ['KeyW', false],
            ['ArrowUp', false],
            ['KeyA', false],
            ['ArrowLeft', false],
            ['KeyS', false],
            ['ArrowDown', false],
            ['KeyD', false],
            ['ArrowRight', false],
            ['Space', false],
        ]);

        this.camera = self.camera;
        this.displacement = new Vector3().fromArray(self.state.pos);

        this.domElement = domElement;
        this.isLocked = false;

        this.pointerSpeed = 1.0;
    }

    private onKeyDown(e: KeyboardEvent) {
        switch (e.code) {
            default:
                const {keys} = this;
                if (!keys.has(e.code)) return;
                if (keys.get(e.code)) return;
                keys.set(e.code, true);
        }
    }

    private onKeyUp(e: KeyboardEvent) {
        const {keys} = this;
        if (!keys.has(e.code)) return;
        if (!keys.get(e.code)) return;
        keys.set(e.code, false);
    }

    private onMouseMove(e: MouseEvent) {
        const { camera, isLocked, pointerSpeed } = this;
        if (!isLocked) return;

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        _euler.setFromQuaternion(camera.quaternion);

        _euler.x -= movementY * 0.002 * pointerSpeed;
        _euler.y -= movementX * 0.002 * pointerSpeed;

        _euler.x = Math.max(-_PI_2, Math.min(_PI_2, _euler.x));

        camera.quaternion.setFromEuler(_euler);

        this.dispatchEvent(_changeEvent);
    }

    private onPointerLockChange() {
        const { domElement } = this;
        if (domElement.ownerDocument.pointerLockElement === domElement) {
            this.dispatchEvent(_lockEvent);
            this.isLocked = true;
        } else {
            this.dispatchEvent(_unlockEvent);
            this.isLocked = false;
        }
    }

    private onPointerLockError() {
        console.error( 'Unable to use Pointer Lock API' );
    }

    public connect() {
        const ownerDocument = this.domElement.ownerDocument;
        ownerDocument.addEventListener('mousemove', this.onMouseMove);
        ownerDocument.addEventListener('pointerlockchange', this.onPointerLockChange);
        ownerDocument.addEventListener('pointerlockerror', this.onPointerLockError);
    }

    public disconnect() {
        const ownerDocument = this.domElement.ownerDocument;
        ownerDocument.addEventListener('mousemove', this.onMouseMove);
        ownerDocument.addEventListener('pointerlockchange', this.onPointerLockChange);
        ownerDocument.addEventListener('pointerlockerror', this.onPointerLockError);
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

    public lock() {
        this.domElement.requestPointerLock();
    }

    public unlock() {
        this.domElement.ownerDocument.exitPointerLock();
    }
}