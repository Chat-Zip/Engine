import '../elements/chatzip-renderer';

import engine from '..';

const world = engine.world;
const self = world.self;

self.gravity.isActive = false;
world.map.applyGridHelper(true);