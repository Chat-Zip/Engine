import Self from "../world/components/user/Self";
import Controls from "./Controls";
import eventKeyListeners from "./KeyEventListeners";

interface Keys {
    move: Map<string, Function>;
    ui: Map<string, Function>;
}

// const _changeEvent = { type: 'change' };
// const _lockEvent = { type: 'lock' };
// const _unlockEvent = { type: 'unlock' };

export default class PointerControls extends Controls {
    public keys: Keys;
    public detectKeyEvents: (isDetect: boolean) => void;
    public connect: () => void;
    public disconnect: () => void;
    public isLocked: boolean;

    constructor(self: Self, canvas: HTMLCanvasElement) {
        super(self, canvas);
        this.keys = {
            move: new Map(),
            ui: new Map(),
        }
        this.isLocked = false;

        const scope = this;
        const ownerDocument = this.domElement.ownerDocument;

        function onMouseMove(e: MouseEvent) {
            if (!scope.isLocked) return;
            const movementX = e.movementX || 0;
            const movementY = e.movementY || 0;
            scope.moveCamera(movementX, movementY);
            scope.dispathControlEvent('change');
        }

        function onPointerLockChange() {
            console.log('POINTER_LOCK_CHANGE');
            if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {
                scope.dispathControlEvent('lock');
                scope.isLocked = true;
            } else {
                scope.dispathControlEvent('unlock');
                scope.isLocked = false;
            }
        }
        function onPointerLockError() {
            console.error( 'Unable to use Pointer Lock API' );
        }

        this.detectKeyEvents = (isDetect) => {
            if (isDetect) {
                eventKeyListeners.active()
                return;
            }
            eventKeyListeners.inactive();
        }

        this.connect = () => {
            ownerDocument.addEventListener('mousemove', onMouseMove);
            this.detectKeyEvents(true);
            ownerDocument.addEventListener('pointerlockchange', onPointerLockChange);
            ownerDocument.addEventListener('pointerlockerror', onPointerLockError);
        }

        this.disconnect = () => {
            ownerDocument.removeEventListener('mousemove', onMouseMove);
            this.detectKeyEvents(false);
            ownerDocument.removeEventListener('pointerlockchange', onPointerLockChange);
            ownerDocument.removeEventListener('pointerlockerror', onPointerLockError);
        }
        this.connect();
    }

    public async lock() {
        await this.domElement.requestPointerLock();
        // this.connect();
        this.isLocked = true;
    }

    public unlock() {
        this.disableMovement();
        this.domElement.ownerDocument.exitPointerLock();
        // this.disconnect();
        this.isLocked = false;
    }
}
