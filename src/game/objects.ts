import * as THREE from 'three';

const skin = new THREE.MeshStandardMaterial({ color: 0xf2c39f, roughness: 0.82, flatShading: true });
const darkHair = new THREE.MeshStandardMaterial({ color: 0x17131a, roughness: 0.9, flatShading: true });
const bamboo = new THREE.MeshStandardMaterial({ color: 0xb47b39, roughness: 0.82, flatShading: true });
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x10192a, roughness: 0.98 });
const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x48506a, roughness: 0.96, flatShading: true });
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x6f2630, roughness: 0.92, flatShading: true });
const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x603925, roughness: 0.92, flatShading: true });
const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xe9b85b, roughness: 0.48, metalness: 0.12 });
const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x15131c, roughness: 0.96 });

const lanternColors = [0xff4f49, 0xff8f3d, 0xffca45, 0xf05d8d, 0x38c4a8];
const facadeColors = [0x5a3344, 0x304764, 0x69402c, 0x354f43, 0x4b385e];
const tunicColors = [0xe94752, 0x258eb2, 0xe19a33, 0x7458c4, 0x31895d];

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,239,174,0.95)');
    gradient.addColorStop(0.3, 'rgba(255,202,86,0.58)');
    gradient.addColorStop(0.72, 'rgba(255,153,62,0.14)');
    gradient.addColorStop(1, 'rgba(255,140,45,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const glowTexture = createGlowTexture();

function createStarShape(outer = 0.48, inner = 0.21): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export function createStarLantern(color = 0xff4f49, scale = 1): THREE.Group {
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xdca752, roughness: 0.5, metalness: 0.08 });
  const paperMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.45,
    roughness: 0.62,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.ExtrudeGeometry(createStarShape(), {
    depth: 0.085,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.018,
    bevelSegments: 1,
  });
  geometry.center();
  const star = new THREE.Mesh(geometry, paperMaterial);
  star.rotation.y = Math.PI;
  group.add(star);

  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 22), new THREE.LineBasicMaterial({ color: 0xffd27b }));
  outline.rotation.y = Math.PI;
  group.add(outline);

  const crossA = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.78, 5), frameMaterial);
  crossA.rotation.z = Math.PI / 2;
  crossA.rotation.y = Math.PI / 2;
  group.add(crossA);

  const crossB = crossA.clone();
  crossB.rotation.z = Math.PI / 2 + Math.PI * 0.31;
  group.add(crossB);

  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.34, 5), frameMaterial);
  tassel.position.y = -0.62;
  group.add(tassel);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity: 0.68, depthWrite: false }));
  glow.scale.set(1.55, 1.55, 1);
  glow.position.z = 0.08;
  group.add(glow);

  return group;
}

export function createLantern(color = lanternColors[0] ?? 0xff4f49, scale = 1): THREE.Group {
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const glowMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.55,
    roughness: 0.58,
    flatShading: true,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 7), glowMaterial);
  body.scale.set(1, 1.25, 0.82);
  group.add(body);

  for (const offset of [-0.37, 0.37]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 8), goldMaterial);
    cap.position.y = offset;
    group.add(cap);
  }

  for (let i = 0; i < 6; i += 1) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.012, 4, 10), goldMaterial);
    rib.rotation.x = Math.PI / 2;
    rib.rotation.y = (Math.PI / 6) * i;
    group.add(rib);
  }

  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.3, 5), goldMaterial);
  tassel.position.y = -0.56;
  group.add(tassel);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity: 0.4, depthWrite: false }));
  glow.scale.set(1.35, 1.35, 1);
  group.add(glow);
  return group;
}

function addFace(group: THREE.Group): void {
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x241b22 });
  for (const x of [-0.115, 0.115]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), eyeMaterial);
    eye.position.set(x, 2.28, 0.337);
    group.add(eye);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.011, 4, 10, Math.PI), new THREE.MeshBasicMaterial({ color: 0x9e4d4c }));
  smile.position.set(0, 2.15, 0.34);
  smile.rotation.z = Math.PI;
  group.add(smile);
}

export function createCharacter(index = 0, withLantern = true): THREE.Group {
  const group = new THREE.Group();
  const tunic = new THREE.MeshStandardMaterial({
    color: tunicColors[index % tunicColors.length] ?? 0xe94752,
    roughness: 0.86,
    flatShading: true,
  });
  const accent = new THREE.MeshStandardMaterial({ color: 0xf4d58c, roughness: 0.72 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x16233d, roughness: 0.96, flatShading: true });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.47, 1.08, 7), tunic);
  torso.position.y = 1.43;
  group.add(torso);

  const tunicTail = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 0.52, 7), tunic);
  tunicTail.position.y = 0.92;
  group.add(tunicTail);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 5, 9, Math.PI), accent);
  collar.position.set(0, 1.9, 0.24);
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 9), skin);
  head.position.y = 2.24;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.365, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.56), darkHair);
  hair.position.y = 2.39;
  group.add(hair);

  if (index % 3 === 1) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), darkHair);
    bun.position.set(-0.23, 2.52, -0.06);
    group.add(bun);
  }

  addFace(group);

  for (const x of [-0.18, 0.18]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.11, 0.67, 6), pants);
    leg.position.set(x, 0.47, 0);
    group.add(leg);

    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 5), darkMaterial);
    shoe.scale.set(0.9, 0.55, 1.35);
    shoe.position.set(x, 0.14, 0.06);
    group.add(shoe);
  }

  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.72, 6), skin);
  leftArm.position.set(-0.43, 1.48, 0.02);
  leftArm.rotation.z = 0.32;
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.46;
  rightArm.rotation.z = -0.52;
  group.add(rightArm);

  if (withLantern) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 1.4, 5), bamboo);
    stick.position.set(0.72, 1.92, 0.03);
    stick.rotation.z = -0.11;
    group.add(stick);

    const lantern = createStarLantern(lanternColors[index % lanternColors.length] ?? 0xff4f49, 0.72);
    lantern.position.set(0.86, 1.06, 0.08);
    lantern.rotation.y = -0.08;
    group.add(lantern);
  }

  return group;
}

export function createMooncake(): THREE.Group {
  const group = new THREE.Group();
  const cake = new THREE.MeshStandardMaterial({ color: 0xb96f32, roughness: 0.72, flatShading: true });
  const top = new THREE.MeshStandardMaterial({ color: 0xe4a94e, roughness: 0.68 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20), cake);
  group.add(base);

  for (let i = 0; i < 10; i += 1) {
    const notch = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), cake);
    const angle = (Math.PI * 2 * i) / 10;
    notch.scale.set(0.65, 1.3, 0.65);
    notch.position.set(Math.cos(angle) * 0.48, 0, Math.sin(angle) * 0.48);
    group.add(notch);
  }

  const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.035, 16), top);
  medallion.position.y = 0.17;
  group.add(medallion);

  for (let i = 0; i < 5; i += 1) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 7, 5), cake);
    const angle = (Math.PI * 2 * i) / 5;
    petal.scale.set(1.45, 0.28, 0.7);
    petal.rotation.y = -angle;
    petal.position.set(Math.cos(angle) * 0.13, 0.195, Math.sin(angle) * 0.13);
    group.add(petal);
  }
  return group;
}

export function createObstacle(): THREE.Group {
  const group = new THREE.Group();
  const crate = new THREE.MeshStandardMaterial({ color: 0x68402a, roughness: 0.95, flatShading: true });
  const strap = new THREE.MeshStandardMaterial({ color: 0x2b2530, roughness: 1 });

  for (let i = 0; i < 2; i += 1) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.82, 0.98), crate);
    box.position.set(i === 0 ? -0.3 : 0.34, 0.42 + i * 0.16, i * 0.09);
    box.rotation.y = i === 0 ? 0.08 : -0.12;
    group.add(box);
  }

  for (const y of [0.36, 0.72]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.055, 1.05), strap);
    band.position.y = y;
    group.add(band);
  }
  return group;
}

export function createSpark(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xfff0a2,
    emissive: 0xffc84a,
    emissiveIntensity: 2.8,
    roughness: 0.32,
    flatShading: true,
  });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), material);
  core.rotation.z = Math.PI / 4;
  group.add(core);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffd15b, transparent: true, opacity: 0.5, depthWrite: false }));
  glow.scale.set(1.1, 1.1, 1);
  group.add(glow);
  return group;
}

function createHouse(side: number, z: number, variation: number): THREE.Group {
  const house = new THREE.Group();
  const facade = new THREE.MeshStandardMaterial({
    color: facadeColors[variation % facadeColors.length] ?? 0x304764,
    roughness: 0.92,
    flatShading: true,
  });
  const height = 3.8 + (variation % 3) * 0.48;
  const houseX = side * 9.15;

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, height, 6.4), facade);
  body.position.set(houseX, height / 2 + 0.15, z);
  house.add(body);

  const roofY = height + 0.6;
  for (const slope of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 6.75), roofMaterial);
    panel.position.set(houseX + slope * 0.93, roofY, z);
    panel.rotation.z = slope * 0.43;
    house.add(panel);
  }

  const roadFaceX = houseX - side * 1.73;
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc76a,
    emissive: 0xff8a35,
    emissiveIntensity: 1.4,
    roughness: 0.5,
  });

  for (const wz of [-1.65, 1.45]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.28, 1.15), woodMaterial);
    frame.position.set(roadFaceX, 2.35, z + wz);
    house.add(frame);
    const window = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.94, 0.82), windowMaterial);
    window.position.set(roadFaceX - side * 0.045, 2.35, z + wz);
    house.add(window);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.9), woodMaterial);
    bar.position.set(roadFaceX - side * 0.09, 2.35, z + wz);
    house.add(bar);
  }

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.9, 1.15), woodMaterial);
  door.position.set(roadFaceX, 1.1, z);
  house.add(door);

  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 2.45), roofMaterial);
  awning.position.set(roadFaceX - side * 0.65, 3.18, z);
  awning.rotation.z = side * 0.14;
  house.add(awning);

  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.45, 1.7), new THREE.MeshStandardMaterial({ color: 0x9f382f, roughness: 0.72 }));
  sign.position.set(roadFaceX - side * 0.12, 3.56, z);
  house.add(sign);

  const lantern = createLantern(lanternColors[variation % lanternColors.length] ?? 0xff4f49, 0.5);
  lantern.position.set(roadFaceX - side * 0.52, 2.95, z + 2.08);
  house.add(lantern);

  return house;
}

function createTree(side: number, z: number): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 1.8, 6), woodMaterial);
  trunk.position.y = 0.9;
  tree.add(trunk);
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x1d694c, roughness: 0.96, flatShading: true });
  for (const [x, y, scale] of [[0, 2.0, 1], [-0.42, 1.88, 0.75], [0.4, 1.95, 0.78]] as const) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72 * scale, 1), leafMaterial);
    crown.position.set(x, y, 0);
    tree.add(crown);
  }
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.42, 8), new THREE.MeshStandardMaterial({ color: 0x9a5434, roughness: 0.9 }));
  pot.position.y = 0.21;
  tree.add(pot);
  tree.position.set(side * 5.45, 0, z);
  return tree;
}

function createLanternCanopy(segmentIndex: number): THREE.Group {
  const canopy = new THREE.Group();
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 10.6, 5), darkMaterial);
  rope.rotation.z = Math.PI / 2;
  rope.position.y = 5.55;
  canopy.add(rope);

  for (let i = 0; i < 5; i += 1) {
    const x = -4.1 + i * 2.05;
    const isStar = (i + segmentIndex) % 3 === 0;
    const lantern = isStar
      ? createStarLantern(lanternColors[(i + segmentIndex) % lanternColors.length] ?? 0xff4f49, 0.48)
      : createLantern(lanternColors[(i + segmentIndex) % lanternColors.length] ?? 0xff4f49, 0.5);
    lantern.position.set(x, 4.9 + Math.sin(i) * 0.12, 0);
    lantern.rotation.y = (i % 2 ? -1 : 1) * 0.12;
    canopy.add(lantern);
  }
  return canopy;
}

export function createStreetSegment(z: number, segmentIndex: number): THREE.Group {
  const group = new THREE.Group();
  group.position.z = z;

  const road = new THREE.Mesh(new THREE.BoxGeometry(11, 0.18, 18), roadMaterial);
  road.position.y = -0.12;
  group.add(road);

  const centerGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(7.4, 18),
    new THREE.MeshBasicMaterial({ color: 0x1c3852, transparent: true, opacity: 0.11, depthWrite: false }),
  );
  centerGlow.rotation.x = -Math.PI / 2;
  centerGlow.position.y = -0.015;
  group.add(centerGlow);

  for (let i = 0; i < 8; i += 1) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.018, 0.035), new THREE.MeshBasicMaterial({ color: 0x75819b, transparent: true, opacity: 0.08 }));
    seam.position.set(0, 0.005, -7.7 + i * 2.2);
    group.add(seam);
  }

  for (const side of [-1, 1]) {
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 18), sidewalkMaterial);
    sidewalk.position.set(side * 7.25, 0, 0);
    group.add(sidewalk);

    for (let i = 0; i < 2; i += 1) {
      group.add(createHouse(side, -4.2 + i * 8.4, segmentIndex * 2 + i));
    }

    if (segmentIndex % 2 === 0) group.add(createTree(side, -0.5 + side * 2.1));
  }

  for (const x of [-3.65, 3.65]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 18), goldMaterial);
    curb.position.set(x, 0.12, 0);
    group.add(curb);
  }

  if (segmentIndex % 2 === 0) {
    const canopy = createLanternCanopy(segmentIndex);
    canopy.position.z = -1.8;
    group.add(canopy);
  }

  return group;
}

export function createMoon(): THREE.Group {
  const group = new THREE.Group();
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(5.15, 32, 24),
    new THREE.MeshStandardMaterial({
      color: 0xffe7a5,
      emissive: 0xffce73,
      emissiveIntensity: 0.68,
      roughness: 0.92,
    }),
  );
  group.add(moon);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffd884, transparent: true, opacity: 0.58, depthWrite: false }));
  halo.scale.set(18, 18, 1);
  halo.position.z = -0.2;
  group.add(halo);

  for (let i = 0; i < 7; i += 1) {
    const crater = new THREE.Mesh(
      new THREE.CircleGeometry(0.22 + (i % 3) * 0.12, 12),
      new THREE.MeshBasicMaterial({ color: 0xd9b66c, transparent: true, opacity: 0.2, depthWrite: false }),
    );
    crater.position.set(-2 + ((i * 1.37) % 4), -1.5 + ((i * 0.91) % 3), 5.03);
    group.add(crater);
  }
  return group;
}

export function createStarField(count = 260): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    positions[offset] = (Math.random() - 0.5) * 180;
    positions[offset + 1] = 9 + Math.random() * 72;
    positions[offset + 2] = -20 - Math.random() * 170;
    const warm = 0.78 + Math.random() * 0.22;
    colors[offset] = 1;
    colors[offset + 1] = warm;
    colors[offset + 2] = 0.68 + Math.random() * 0.28;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.2, transparent: true, opacity: 0.88, vertexColors: true, sizeAttenuation: true });
  return new THREE.Points(geometry, material);
}

export function createFireflyField(count = 70): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    positions[offset] = (Math.random() - 0.5) * 17;
    positions[offset + 1] = 0.7 + Math.random() * 5.2;
    positions[offset + 2] = 8 - Math.random() * 90;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xffd978, size: 0.08, transparent: true, opacity: 0.72, depthWrite: false }),
  );
}

export function createCloudLayer(): THREE.Group {
  const layer = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xb7cbe6, transparent: true, opacity: 0.055, depthWrite: false });
  for (let i = 0; i < 9; i += 1) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(2.2 + j * 0.35, 8, 5), material);
      puff.scale.y = 0.4;
      puff.position.x = (j - 1.5) * 2.4;
      puff.position.y = Math.sin(j * 1.8) * 0.4;
      cloud.add(puff);
    }
    cloud.position.set((Math.random() - 0.5) * 95, 18 + Math.random() * 22, -35 - Math.random() * 120);
    cloud.rotation.y = Math.random() * 0.8 - 0.4;
    layer.add(cloud);
  }
  return layer;
}

export function randomLanternColor(): number {
  return lanternColors[Math.floor(Math.random() * lanternColors.length)] ?? 0xff4f49;
}
