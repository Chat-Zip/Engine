import Self from "../world/components/user/Self";
import Controls from "./Controls";
import Peer from "../connection/Peer";

type Peers = Map<string, Peer>;

interface Keys {
    move: Map<string, Function>;
    ui: Map<string, Function>;
}

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

export default class PointerControls extends Controls {
    public keys: Keys;
    public connect: Function;
    public disconnect: Function;
    public isLocked: boolean;

    constructor(self: Self, canvas: HTMLCanvasElement, peers: Peers) {
        super(self, canvas, peers);
        this.keys = {
            move: new Map(),
            ui: new Map(),
        }
        this.isLocked = false;

        const scope = this;

        function onMouseMove(e: MouseEvent) {
            if (!scope.isLocked) return;
            const movementX = e.movementX || 0;
            const movementY = e.movementY || 0;
            scope.moveCamera(movementX, movementY);
            scope.dispatchEvent(_changeEvent);
        }

        function onPointerLockChange() {
            if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {
                scope.dispatchEvent(_lockEvent);
                scope.isLocked = true;
            } else {
                scope.dispatchEvent(_unlockEvent);
                scope.isLocked = false;
            }
        }
        function onPointerLockError() {
            console.error( 'Unable to use Pointer Lock API' );
        }

        this.connect = () => {
            const ownerDocument = scope.domElement.ownerDocument;
            ownerDocument.addEventListener('mousemove', onMouseMove);
            ownerDocument.addEventListener('pointerlockchange', onPointerLockChange);
            ownerDocument.addEventListener('pointerlockerror', onPointerLockError);
        }

        this.disconnect = () => {
            const ownerDocument = scope.domElement.ownerDocument;
            ownerDocument.addEventListener('mousemove', onMouseMove);
            ownerDocument.addEventListener('pointerlockchange', onPointerLockChange);
            ownerDocument.addEventListener('pointerlockerror', onPointerLockError);
        }
        this.connect();
    }

    public updateMovementFromKey(keyCode: string, isDown: boolean) {
        const key = this.keys.move;
        if (!key.has(keyCode)) return;
        key.get(keyCode)(isDown);
    }

    public eventKeyDown(e: KeyboardEvent) {
        const { move, ui } = this.keys;
        const keyCode = e.code;
        if (move.has(keyCode)) {
            this.updateMovementFromKey(e.code, true);
            return;
        }
        if (ui.has(keyCode)) {
            ui.get(keyCode)();
        }
    }

    public eventKeyUp(e: KeyboardEvent) {
        const keyCode = e.code;
        if (!this.keys.move.get(keyCode)) return;
        this.updateMovementFromKey(keyCode, false);
    }

    public lock() {
        this.domElement.requestPointerLock();
    }

    public unlock() {
        this.domElement.ownerDocument.exitPointerLock();
    }
}
