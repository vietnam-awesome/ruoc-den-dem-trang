import { Container, Graphics } from 'pixi.js';
import { characterSvg, lanternSvg } from './characterArt';

const lanternColors = [0xff4d4f, 0xff9f43, 0xffd84d, 0xef5da8, 0x3ed6c4];

function colorAt<T>(values: readonly T[], index: number, fallback: T): T {
  return values[((index % values.length) + values.length) % values.length] ?? fallback;
}

function starPoints(outer: number, inner: number, points = 5): number[] {
  const values: number[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + i * step;
    values.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return values;
}

export type CharacterArt = Container & {
  bobSeed: number;
  lanternArt: Container | null;
  bodyArt: Graphics;
};

export function createCharacter(index = 0, withLantern = true): CharacterArt {
  const group = new Container() as CharacterArt;
  group.bobSeed = index * 0.73 + 0.3;
  group.lanternArt = null;

  const body = new Graphics().svg(characterSvg(index));
  body.scale.set(0.58);
  body.position.set(-64, -180);
  group.bodyArt = body;
  group.addChild(body);

  if (withLantern) {
    const lantern = new Container();
    const halo = new Graphics();
    halo.circle(0, 0, 42).fill({ color: colorAt(lanternColors, index, 0xff4d4f), alpha: 0.075 });
    const art = new Graphics().svg(lanternSvg(index));
    art.scale.set(0.48);
    art.position.set(-36, -35);
    lantern.addChild(halo, art);
    lantern.position.set(49, -137);
    group.addChild(lantern);
    group.lanternArt = lantern;
  }

  return group;
}

export function createMooncake(): Container {
  const group = new Container();
  const glow = new Graphics();
  glow.circle(0, 0, 38).fill({ color: 0xffc86a, alpha: 0.08 });
  const cake = new Graphics();
  cake.circle(0, 0, 24).fill(0xc97b38).stroke({ color: 0xf6bd61, width: 3 });
  cake.circle(0, 0, 16).stroke({ color: 0xf7cf83, width: 2, alpha: 0.86 });
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * 2 * i) / 8;
    cake.circle(Math.cos(a) * 17, Math.sin(a) * 17, 4).fill({ color: 0xe3a34d, alpha: 0.9 });
  }
  cake.poly(starPoints(10, 4, 6)).fill({ color: 0xffd98e, alpha: 0.78 });
  group.addChild(glow, cake);
  return group;
}

export function createSpark(): Container {
  const group = new Container();
  const art = new Graphics();
  art.circle(0, 0, 30).fill({ color: 0xffe889, alpha: 0.08 });
  art.poly([0, -22, 6, -6, 22, 0, 6, 6, 0, 22, -6, 6, -22, 0, -6, -6]).fill({ color: 0xffdf69, alpha: 0.95 });
  art.circle(0, 0, 6).fill(0xfff6c6);
  group.addChild(art);
  return group;
}

export function createObstacle(): Container {
  const group = new Container();
  const shadow = new Graphics();
  shadow.ellipse(0, 5, 56, 14).fill({ color: 0x07101f, alpha: 0.32 });
  const cart = new Graphics();
  cart.roundRect(-50, -57, 100, 58, 10).fill(0x74462e).stroke({ color: 0xd6a161, width: 3 });
  cart.rect(-43, -47, 86, 9).fill({ color: 0xe0ad65, alpha: 0.7 });
  cart.rect(-43, -26, 86, 8).fill({ color: 0xe0ad65, alpha: 0.48 });
  cart.moveTo(0, -56).lineTo(0, -2).stroke({ color: 0x3c2923, width: 6 });
  cart.circle(-32, 6, 11).fill(0x211b20).circle(32, 6, 11).fill(0x211b20);
  group.addChild(shadow, cart);
  return group;
}

function createStarLantern(index: number, scale = 1): Container {
  const wrap = new Container();
  wrap.scale.set(scale);
  const color = colorAt(lanternColors, index, 0xff4d4f);
  const halo = new Graphics();
  halo.circle(0, 0, 45).fill({ color, alpha: 0.06 });
  const star = new Graphics();
  star.poly(starPoints(31, 14)).fill({ color, alpha: 0.82 }).stroke({ color: 0xffd67d, width: 4 });
  star.poly(starPoints(20, 9)).stroke({ color: 0xfff0b5, width: 2, alpha: 0.68 });
  star.circle(0, 0, 6).fill({ color: 0xfff4c8, alpha: 0.9 });
  wrap.addChild(halo, star);
  return wrap;
}

function createHouse(index: number): Container {
  const group = new Container();
  const facades = [0x74384a, 0x315b79, 0x85613d, 0x3d6357, 0x66477b];
  const facade = colorAt(facades, index, 0x74384a);
  const house = new Graphics();
  house.roundRect(-112, -214, 224, 214, 14).fill(facade);
  house.poly([-130, -214, 0, -274, 130, -214]).fill(0x452633).stroke({ color: 0xb96c5d, width: 4 });
  house.rect(-92, -167, 76, 76).fill(0x16253e).stroke({ color: 0xe8ba75, width: 3 });
  house.rect(16, -167, 76, 76).fill(0x16253e).stroke({ color: 0xe8ba75, width: 3 });
  house.rect(-82, -157, 56, 56).fill({ color: 0xffcd78, alpha: 0.34 });
  house.rect(26, -157, 56, 56).fill({ color: 0xffcd78, alpha: 0.28 });
  house.roundRect(-37, -84, 74, 84, 8).fill(0x281e29).stroke({ color: 0xd2a064, width: 3 });
  house.poly([-101, -91, 101, -91, 87, -63, -87, -63]).fill(index % 2 ? 0xe6af4e : 0xe75b57);
  group.addChild(house);
  const lantern = createStarLantern(index + 2, 0.42);
  lantern.position.set(-78, -121);
  group.addChild(lantern);
  return group;
}

export function createSceneryRow(index: number): Container {
  const row = new Container();
  const left = createHouse(index);
  left.position.x = -410;
  const right = createHouse(index + 2);
  right.position.x = 410;
  row.addChild(left, right);
  const wire = new Graphics();
  wire.moveTo(-300, -220).lineTo(300, -220).stroke({ color: 0xc8a56b, width: 2, alpha: 0.72 });
  row.addChild(wire);
  for (let i = 0; i < 5; i += 1) {
    const lantern = createStarLantern(index + i, 0.28);
    lantern.position.set(-240 + i * 120, -220 + Math.sin(i * 1.3) * 8);
    row.addChild(lantern);
  }
  const trees = new Graphics();
  trees.rect(-330, -116, 12, 116).fill(0x4b382b);
  trees.circle(-324, -136, 43).fill({ color: 0x173f39, alpha: 0.95 });
  trees.circle(-355, -120, 28).fill({ color: 0x1f5245, alpha: 0.92 });
  trees.rect(318, -116, 12, 116).fill(0x4b382b);
  trees.circle(324, -136, 43).fill({ color: 0x173f39, alpha: 0.95 });
  trees.circle(354, -120, 28).fill({ color: 0x1f5245, alpha: 0.92 });
  row.addChild(trees);
  return row;
}

export function createMoon(): Container {
  const group = new Container();
  const halo = new Graphics();
  halo.circle(0, 0, 104).fill({ color: 0xffdb7a, alpha: 0.045 });
  halo.circle(0, 0, 80).fill({ color: 0xffdb7a, alpha: 0.08 });
  const moon = new Graphics();
  moon.circle(0, 0, 58).fill(0xffe9ad);
  moon.circle(-19, -13, 10).fill({ color: 0xe0c985, alpha: 0.25 });
  moon.circle(21, 9, 14).fill({ color: 0xd7c17f, alpha: 0.2 });
  moon.circle(7, -27, 7).fill({ color: 0xd6bf7d, alpha: 0.2 });
  group.addChild(halo, moon);
  return group;
}

export function createCloud(seed = 0): Container {
  const group = new Container();
  const cloud = new Graphics();
  const tint = seed % 2 === 0 ? 0x9db0d5 : 0xb7bfd6;
  cloud.ellipse(-30, 0, 42, 18).fill({ color: tint, alpha: 0.09 });
  cloud.ellipse(0, -8, 54, 24).fill({ color: tint, alpha: 0.11 });
  cloud.ellipse(40, 1, 48, 20).fill({ color: tint, alpha: 0.08 });
  group.addChild(cloud);
  return group;
}
