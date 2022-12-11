class KeyEventListeners {
    public move: Map<string, (isDown: boolean) => void>;
    public ui: Map<string, Function>
    public active: (keyType?: 'move' | 'ui') => void;
    public inactive: (keyType?: 'move' | 'ui') => void;

    private isMoveActived: boolean;
    private isUiActived: boolean;

    constructor() {
        this.move = new Map();
        this.ui = new Map();
        this.isMoveActived = false;
        this.isUiActived = false;

        const scope = this;

        function eventMoveKeyDown(e: KeyboardEvent) {
            const move = scope.move;
            const keyCode = e.code;
            if (!move.has(keyCode)) return;
            move.get(keyCode)?.(true);
        }
        function eventMoveKeyUp(e: KeyboardEvent) {
            const move = scope.move;
            const keyCode = e.code;
            if (!move.has(keyCode)) return;
            move.get(keyCode)?.(false);
        }
        function eventUiKeyDown(e: KeyboardEvent) {
            const ui = scope.ui;
            const keyCode = e.code;
            if (!ui.has(keyCode)) return;
            ui.get(keyCode)?.();
        }

        this.active = (keyType?: 'move' | 'ui') => {
            switch(keyType) {
                case 'move':
                    if (this.isMoveActived) return;
                    document.addEventListener('keydown', eventMoveKeyDown);
                    document.addEventListener('keyup', eventMoveKeyUp);
                    this.isMoveActived = true;
                    return;
                case 'ui' :
                    if (this.isUiActived) return;
                    document.addEventListener('keydown', eventUiKeyDown);
                    this.isUiActived = true;
                    return;
                default:
                    document.addEventListener('keydown', eventMoveKeyDown);
                    document.addEventListener('keyup', eventMoveKeyUp);
                    document.addEventListener('keydown', eventUiKeyDown);
                    this.isMoveActived = true;
                    this.isUiActived = true;
            }
        }
        this.inactive = (keyType?: 'move' | 'ui') => {
            switch(keyType) {
                case 'move':
                    document.removeEventListener('keydown', eventMoveKeyDown);
                    document.removeEventListener('keyup', eventMoveKeyUp);
                    this.isMoveActived = false;
                    return;
                case 'ui' :
                    document.removeEventListener('keydown', eventUiKeyDown);
                    this.isUiActived = false;
                    return;
                default:
                    document.removeEventListener('keydown', eventMoveKeyDown);
                    document.removeEventListener('keyup', eventMoveKeyUp);
                    document.removeEventListener('keydown', eventUiKeyDown);
                    this.isMoveActived = false;
                    this.isUiActived = false;
            }
        }
    }
}

export default new KeyEventListeners();