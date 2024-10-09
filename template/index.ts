import '../elements/chatzip-renderer';

import engine from '..';

const world = engine.world;
const self = world.self;

self.gravity.isActive = false;
world.map.applyGridHelper(true);

const fullScreenBtn = document.createElement('button');
fullScreenBtn.innerText = "FULLSCREEN";
fullScreenBtn.onclick = () => {
    engine.setFullScreen(true);
}
document.body.appendChild(fullScreenBtn);