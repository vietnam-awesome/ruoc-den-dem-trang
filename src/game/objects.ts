import { Container } from 'pixi.js';
import {
  createCloud,
  createMoon,
  createMooncake as createLegacyMooncake,
  createObstacle as createLegacyObstacle,
  createSceneryRow,
  createSpark as createLegacySpark,
} from './objectsLegacy';

export { createCloud, createMoon, createSceneryRow };
export { createCharacter } from './characters';
export type { CharacterArt } from './characters';

function enlarged(factory: () => Container, scale: number): Container {
  const wrapper = new Container();
  const art = factory();
  art.scale.set(scale);
  wrapper.addChild(art);
  return wrapper;
}

export function createMooncake(): Container {
  return enlarged(createLegacyMooncake, 1.32);
}

export function createSpark(): Container {
  return enlarged(createLegacySpark, 1.42);
}

export function createObstacle(): Container {
  return enlarged(createLegacyObstacle, 1.13);
}
