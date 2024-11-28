import Self from "../world/components/user/Self";
import Controls from "./Controls";

const _prevPos: number[] = [0, 0];
let _startTime: number = 0;

export default class TouchControls extends Controls {

    public connect: () => void;
    public disconnect: () => void;

    constructor(self: Self, canvas: HTMLCanvasElement) {
        super(self, canvas);

        const scope = this;

        function onTouchStart(e: TouchEvent) {
            const touches = e.touches[0];
            _startTime = e.timeStamp;
            _prevPos[0] = touches.pageX;
            _prevPos[1] = touches.pageY;
            scope.dispathControlEvent('starttouch', { detail: touches });
        }

        function onTouchMove(e: TouchEvent) {
            const touches = e.touches[0];
            const movementX = touches.pageX - _prevPos[0];
            const movementY = touches.pageY - _prevPos[1];
            scope.moveCamera(movementX, movementY);
            _prevPos[0] = touches.pageX;
            _prevPos[1] = touches.pageY;
            scope.dispathControlEvent('movetouch', { detail: touches });
        }

        function onTouchEnd(e: TouchEvent) {
            const touches = e.changedTouches[0];
            scope.dispathControlEvent('endtouch', { detail: touches });
            if ((e.timeStamp - _startTime) > 100) return;
            scope.dispathControlEvent('touch');
        }

        this.connect = () => {
            canvas.ontouchstart = onTouchStart;
            canvas.ontouchmove = onTouchMove;
            canvas.ontouchend = onTouchEnd;
        }

        this.disconnect = () => {
            canvas.ontouchstart = null;
            canvas.ontouchmove = null;
            canvas.ontouchend = null;
        }

        this.disconnect();
        this.connect();
    }
}
