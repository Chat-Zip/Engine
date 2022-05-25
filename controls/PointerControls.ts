import Self from "../world/components/user/Self";
import Controls from "./Controls";
import { Peers } from "../connection/Peer";

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

        function updateMovementFromKey(keyCode: string, isDown: boolean) {
            const key = scope.keys.move;
            if (!key.has(keyCode)) return;
            key.get(keyCode)(isDown);
        }

        function eventKeyDown(e: KeyboardEvent) {
            const { move, ui } = scope.keys;
            const keyCode = e.code;
            if (move.has(keyCode)) {
                updateMovementFromKey(e.code, true);
                return;
            }
            if (ui.has(keyCode)) {
                ui.get(keyCode)();
            }
        }

        function eventKeyUp(e: KeyboardEvent) {
            const keyCode = e.code;
            if (!scope.keys.move.get(keyCode)) return;
            updateMovementFromKey(keyCode, false);
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
            ownerDocument.addEventListener('keydown', eventKeyDown);
            ownerDocument.addEventListener('keyup', eventKeyUp);
            ownerDocument.addEventListener('pointerlockchange', onPointerLockChange);
            ownerDocument.addEventListener('pointerlockerror', onPointerLockError);
        }

        this.disconnect = () => {
            const ownerDocument = scope.domElement.ownerDocument;
            ownerDocument.removeEventListener('mousemove', onMouseMove);
            ownerDocument.removeEventListener('keydown', eventKeyDown);
            ownerDocument.removeEventListener('keyup', eventKeyUp);
            ownerDocument.removeEventListener('pointerlockchange', onPointerLockChange);
            ownerDocument.removeEventListener('pointerlockerror', onPointerLockError);
        }
        this.connect();
    }

    public lock() {
        this.domElement.requestPointerLock();
    }

    public unlock() {
        this.domElement.ownerDocument.exitPointerLock();
    }
}
