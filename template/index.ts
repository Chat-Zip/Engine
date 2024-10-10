import '../elements/chatzip-renderer';
import engine from '..';

window.onload = () => {
    document.getElementById('btn-editor-on')!.onclick = () => engine.enableEditor(true);
    document.getElementById('btn-editor-off')!.onclick = () => engine.enableEditor(false);
}