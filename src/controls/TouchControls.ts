import Self from "../world/components/user/Self";
import Controls from "./Controls";

const _prevPos: number[] = [undefined, undefined];

export default class TouchControls extends Controls {
    constructor(self: Self, canvas: HTMLCanvasElement) {
        super(self, canvas);

        const scope = this;

        function onTouchStart(e: TouchEvent) {
            const touches = e.touches[0];
            _prevPos[0] = touches.pageX;
            _prevPos[1] = touches.pageY;
        }

        function onTouchMove(e: TouchEvent) {
            const touches = e.touches[0];
            const movementX = _prevPos[0] - touches.pageX;
            const movementY = _prevPos[1] - touches.pageY;
            scope.moveCamera(movementX, movementY);
            _prevPos[0] = touches.pageX;
            _prevPos[1] = touches.pageY;
        }

        const ownerDocument = this.domElement.ownerDocument;
        ownerDocument.addEventListener('touchstart', onTouchStart);
        ownerDocument.addEventListener('touchmove', onTouchMove);
    }
}
