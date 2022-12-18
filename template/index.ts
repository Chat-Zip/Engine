import '../elements/chatzip-renderer';
import '../elements/chatzip-crosshair';
import '../elements/chatzip-palette';
import '../elements/chatzip-world-file-manager';

import engine from '..';

const world = engine.world;
const self = world.self;

self.gravity.isActive = false;
world.map.applyGridHelper(true);