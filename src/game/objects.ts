import { Container, Graphics } from 'pixi.js';

const lanternColors = [0xff4d4f, 0xff9f43, 0xffd84d, 0xef5da8, 0x3ed6c4];
const outfitColors = [0xdf4057, 0x248fb8, 0xe8922f, 0x7659cf, 0x329168, 0xc7538f];

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

function colorAt<T>(values: readonly T[], index: number, fallback: T): T {
  return values[((index % values.length) + values.length) % values.length] ?? fallback;
}

export function randomLanternColor(): number {
  return colorAt(lanternColors, Math.floor(Math.random() * lanternColors.length), 0xff4d4f);
}

export function createStarLantern(color = 0xff4d4f, scale = 1): Container {
  const group = new Container();
  group.scale.set(scale);

  const halo = new Graphics();
  halo.circle(0, 0, 54).fill({ color, alpha: 0.055 });
  halo.circle(0, 0, 40).fill({ color, alpha: 0.08 });
  group.addChild(halo);

  const frame = new Graphics();
  frame.poly(starPoints(34, 15)).fill({ color, alpha: 0.88 }).stroke({ color: 0xffcf72, width: 4, alpha: 0.95 });
  frame.poly(starPoints(22, 10)).stroke({ color: 0xffe7aa, width: 1.5, alpha: 0.75 });
  group.addChild(frame);

  const center = new Graphics();
  center.circle(0, 0, 7).fill({ color: 0xfff0ba, alpha: 0.92 });
  group.addChild(center);

  const tassel = new Graphics();
  tassel.moveTo(0, 35).lineTo(0, 51).stroke({ color: 0xf1b75f, width: 2.5 });
  tassel.moveTo(-5, 50).lineTo(0, 61).lineTo(5, 50).stroke({ color: 0xf1b75f, width: 2 });
  group.addChild(tassel);

  return group;
}

export type CharacterArt = Container & {
  bobSeed: number;
  lanternArt: Container | null;
};

export function createCharacter(index = 0, withLantern = true): CharacterArt {
  const group = new Container() as CharacterArt;
  group.bobSeed = index * 0.73 + 0.3;
  group.lanternArt = null;

  const outfit = colorAt(outfitColors, index, 0xdf4057);
  const skin = 0xf1bc91;
  const dark = 0x1c1720;
  const trousers = 0x1a2840;

  const shadow = new Graphics();
  shadow.ellipse(0, 4, 34, 10).fill({ color: 0x07101f, alpha: 0.28 });
  group.addChild(shadow);

  const legs = new Graphics();
  legs.roundRect(-17, -34, 12, 37, 6).fill(trousers);
  legs.roundRect(5, -34, 12, 37, 6).fill(trousers);
  legs.ellipse(-12, 2, 17, 6).fill({ color: 0xf5d6a2, alpha: 0.95 });
  legs.ellipse(12, 2, 17, 6).fill({ color: 0xf5d6a2, alpha: 0.95 });
  group.addChild(legs);

  const body = new Graphics();
  body.roundRect(-25, -91, 50, 65, 18).fill(outfit);
  body.poly([-25, -42, 0, -25, 25, -42, 18, -18, 0, -12, -18, -18]).fill({ color: outfit, alpha: 0.92 });
  body.poly([-9, -90, 0, -80, 9, -90]).fill({ color: 0xffe3ad, alpha: 0.95 });
  body.moveTo(0, -80).lineTo(0, -31).stroke({ color: 0xffe3ad, width: 2, alpha: 0.62 });
  group.addChild(body);

  const armBack = new Graphics();
  armBack.roundRect(-35, -83, 12, 49, 6).fill({ color: skin });
  armBack.rotation = 0.13;
  group.addChild(armBack);

  const head = new Graphics();
  head.circle(0, -115, 27).fill(skin);
  head.ellipse(0, -132, 27, 13).fill(dark);
  head.circle(-10, -118, 2).fill(0x2c2330);
  head.circle(10, -118, 2).fill(0x2c2330);
  head.moveTo(-6, -106).lineTo(0, -103).lineTo(6, -106).stroke({ color: 0xa05f55, width: 1.7, alpha: 0.8 });
  group.addChild(head);

  const cheek = new Graphics();
  cheek.circle(-17, -109, 4).fill({ color: 0xf28c87, alpha: 0.28 });
  cheek.circle(17, -109, 4).fill({ color: 0xf28c87, alpha: 0.28 });
  group.addChild(cheek);

  const armFront = new Graphics();
  armFront.roundRect(24, -84, 12, 52, 6).fill({ color: skin });
  armFront.rotation = -0.14;
  group.addChild(armFront);

  if (withLantern) {
    const pole = new Graphics();
    pole.moveTo(34, -79).lineTo(59, -145).stroke({ color: 0xc8964f, width: 4, alpha: 0.95 });
    group.addChild(pole);

    const lantern = createStarLantern(colorAt(lanternColors, index, 0xff4d4f), 0.72);
    lantern.position.set(60, -153);
    group.addChild(lantern);
    group.lanternArt = lantern;
  }

  return group;
}

export function createMooncake(): Container {
  const group = new Container();

  const glow = new Graphics();
  glow.circle(0, 0, 38).fill({ color: 0xffc86a, alpha: 0.08 });
  group.addChild(glow);

  const base = new Graphics();
  base.circle(0, 0, 24).fill(0xc97b38).stroke({ color: 0xf6bd61, width: 3 });
  base.circle(0, 0, 16).stroke({ color: 0xf7cf83, width: 2, alpha: 0.86 });
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * 2 * i) / 8;
    base.circle(Math.cos(a) * 17, Math.sin(a) * 17, 4).fill({ color: 0xe3a34d, alpha: 0.9 });
  }
  base.poly(starPoints(10, 4, 6)).fill({ color: 0xffd98e, alpha: 0.78 });
  group.addChild(base);

  return group;
}

export function createSpark(): Container {
  const group = new Container();
  const glow = new Graphics();
  glow.circle(0, 0, 30).fill({ color: 0xffe889, alpha: 0.08 });
  glow.poly([0, -22, 6, -6, 22, 0, 6, 6, 0, 22, -6, 6, -22, 0, -6, -6]).fill({ color: 0xffdf69, alpha: 0.95 });
  glow.circle(0, 0, 6).fill(0xfff6c6);
  group.addChild(glow);
  return group;
}

export function createObstacle(): Container {
  const group = new Container();
  const shadow = new Graphics();
  shadow.ellipse(0, 4, 50, 14).fill({ color: 0x07101f, alpha: 0.32 });
  group.addChild(shadow);

  const cart = new Graphics();
  cart.roundRect(-45, -55, 90, 55, 9).fill(0x74462e).stroke({ color: 0xc99558, width: 3 });
  cart.rect(-39, -45, 78, 8).fill({ color: 0xd3a15f, alpha: 0.72 });
  cart.rect(-39, -25, 78, 7).fill({ color: 0xd3a15f, alpha: 0.52 });
  cart.moveTo(-2, -54).lineTo(-2, -2).stroke({ color: 0x3f2b26, width: 6, alpha: 0.8 });
  cart.circle(-29, 4, 10).fill(0x231c21).circle(29, 4, 10).fill(0x231c21);
  group.addChild(cart);

  const ribbon = createStarLantern(0xff584f, 0.35);
  ribbon.position.set(0, -57);
  group.addChild(ribbon);
  return group;
}

function createHouse(index: number, side: -1 | 1): Container {
  const group = new Container();
  const facadeColors = [0x6e3545, 0x35577b, 0x80603a, 0x375b55, 0x5f4475];
  const facade = colorAt(facadeColors, index, 0x6e3545);

  const building = new Graphics();
  building.roundRect(-110, -210, 220, 210, 14).fill(facade);
  building.rect(-96, -193, 192, 10).fill({ color: 0xe8c387, alpha: 0.18 });
  building.poly([-126, -210, 0, -268, 126, -210]).fill(0x492736).stroke({ color: 0xb26b5e, width: 4 });
  building.rect(-88, -162, 72, 72).fill(0x182642).stroke({ color: 0xeab873, width: 3 });
  building.rect(16, -162, 72, 72).fill(0x182642).stroke({ color: 0xeab873, width: 3 });
  building.rect(-80, -154, 56, 56).fill({ color: 0xffc96c, alpha: 0.36 });
  building.rect(24, -154, 56, 56).fill({ color: 0xffc96c, alpha: 0.28 });
  building.roundRect(-35, -83, 70, 83, 8).fill(0x281e29).stroke({ color: 0xd2a064, width: 3 });
  building.rect(-120, -190, 240, 18).fill({ color: 0xf0c37d, alpha: 0.18 });
  group.addChild(building);

  const awning = new Graphics();
  awning.poly([-100, -87, 100, -87, 86, -60, -86, -60]).fill(index % 2 === 0 ? 0xe7534f : 0xdba84d);
  group.addChild(awning);

  const porchLantern = createStarLantern(colorAt(lanternColors, index + 2, 0xff9f43), 0.42);
  porchLantern.position.set(side * -80, -118);
  group.addChild(porchLantern);

  return group;
}

export function createSceneryRow(index: number): Container {
  const row = new Container();

  const left = createHouse(index, -1);
  left.position.x = -410;
  row.addChild(left);

  const right = createHouse(index + 2, 1);
  right.position.x = 410;
  row.addChild(right);

  const wire = new Graphics();
  wire.moveTo(-300, -220).lineTo(300, -220).stroke({ color: 0xc8a56b, width: 2, alpha: 0.7 });
  row.addChild(wire);

  for (let i = 0; i < 5; i += 1) {
    const lantern = createStarLantern(colorAt(lanternColors, index + i, 0xff4d4f), 0.28);
    lantern.position.set(-240 + i * 120, -220 + Math.sin(i * 1.3) * 8);
    row.addChild(lantern);
  }

  const treeLeft = new Graphics();
  treeLeft.rect(-327, -115, 12, 115).fill(0x4b382b);
  treeLeft.circle(-322, -134, 42).fill({ color: 0x173f39, alpha: 0.95 });
  treeLeft.circle(-352, -120, 27).fill({ color: 0x1f5245, alpha: 0.92 });
  row.addChild(treeLeft);

  const treeRight = new Graphics();
  treeRight.rect(315, -115, 12, 115).fill(0x4b382b);
  treeRight.circle(322, -134, 42).fill({ color: 0x173f39, alpha: 0.95 });
  treeRight.circle(350, -120, 27).fill({ color: 0x1f5245, alpha: 0.92 });
  row.addChild(treeRight);

  return row;
}

export function createMoon(): Container {
  const group = new Container();
  const halo = new Graphics();
  halo.circle(0, 0, 102).fill({ color: 0xffdb7a, alpha: 0.045 });
  halo.circle(0, 0, 78).fill({ color: 0xffdb7a, alpha: 0.08 });
  group.addChild(halo);

  const moon = new Graphics();
  moon.circle(0, 0, 58).fill(0xffe9ad);
  moon.circle(-19, -13, 10).fill({ color: 0xe0c985, alpha: 0.25 });
  moon.circle(21, 9, 14).fill({ color: 0xd7c17f, alpha: 0.2 });
  moon.circle(7, -27, 7).fill({ color: 0xd6bf7d, alpha: 0.2 });
  moon.circle(-4, 28, 8).fill({ color: 0xe4ce90, alpha: 0.18 });
  group.addChild(moon);

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
