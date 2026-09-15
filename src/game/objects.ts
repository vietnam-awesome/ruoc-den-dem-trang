import * as THREE from 'three';

const skin = new THREE.MeshStandardMaterial({ color: 0xf2c6a0, roughness: 0.95 });
const darkHair = new THREE.MeshStandardMaterial({ color: 0x19151a, roughness: 1 });
const bamboo = new THREE.MeshStandardMaterial({ color: 0xa97a45, roughness: 0.9 });
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x17223a, roughness: 1 });
const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x5b6172, roughness: 1 });
const houseMaterial = new THREE.MeshStandardMaterial({ color: 0x253653, roughness: 1 });
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x401f2d, roughness: 1 });

const lanternColors = [0xff5c58, 0xffa53b, 0xffd84a, 0xf15bb5, 0x55d6be];

export function createLantern(color = lanternColors[0] ?? 0xff5c58, scale = 1): THREE.Group {
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const glowMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.8,
    roughness: 0.55,
  });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xf2b35d, metalness: 0.1, roughness: 0.6 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.55, 12), glowMaterial);
  body.rotation.z = Math.PI / 2;
  group.add(body);

  for (const offset of [-0.27, 0.27]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 6, 12), rimMaterial);
    rim.rotation.y = Math.PI / 2;
    rim.position.x = offset;
    group.add(rim);
  }

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 5, 12, Math.PI), rimMaterial);
  handle.rotation.z = Math.PI / 2;
  handle.position.y = 0.42;
  group.add(handle);

  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.35, 5), rimMaterial);
  tassel.position.y = -0.46;
  group.add(tassel);

  return group;
}

export function createCharacter(index = 0, withLantern = true): THREE.Group {
  const group = new THREE.Group();
  const shirtColors = [0xe84755, 0x28a6c7, 0xf2a93b, 0x6a61d8, 0x35a86b];
  const shirt = new THREE.MeshStandardMaterial({
    color: shirtColors[index % shirtColors.length] ?? 0xe84755,
    roughness: 0.9,
  });
  const pants = new THREE.MeshStandardMaterial({ color: 0x17213a, roughness: 1 });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 1.05, 8), shirt);
  torso.position.y = 1.45;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), skin);
  head.position.y = 2.24;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.52), darkHair);
  hair.position.y = 2.38;
  group.add(hair);

  for (const x of [-0.18, 0.18]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.72, 6), pants);
    leg.position.set(x, 0.58, 0);
    group.add(leg);
  }

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6), skin);
  arm.position.set(0.52, 1.55, 0);
  arm.rotation.z = -0.4;
  group.add(arm);

  if (withLantern) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.25, 5), bamboo);
    stick.position.set(0.72, 1.95, 0);
    stick.rotation.z = -0.15;
    group.add(stick);

    const lantern = createLantern(lanternColors[index % lanternColors.length], 0.72);
    lantern.position.set(0.84, 1.05, 0);
    group.add(lantern);
  }

  return group;
}

export function createMooncake(): THREE.Group {
  const group = new THREE.Group();
  const cake = new THREE.MeshStandardMaterial({ color: 0xc9873e, roughness: 0.8 });
  const top = new THREE.MeshStandardMaterial({ color: 0xe4ad5c, roughness: 0.75 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.28, 16), cake);
  group.add(base);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.055, 6, 12), top);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.16;
  group.add(ring);

  for (let i = 0; i < 4; i += 1) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5), top);
    const angle = (Math.PI / 2) * i;
    petal.scale.set(1.8, 0.35, 0.8);
    petal.position.set(Math.cos(angle) * 0.16, 0.18, Math.sin(angle) * 0.16);
    group.add(petal);
  }

  return group;
}

export function createObstacle(): THREE.Group {
  const group = new THREE.Group();
  const crate = new THREE.MeshStandardMaterial({ color: 0x6c4630, roughness: 1 });
  const strap = new THREE.MeshStandardMaterial({ color: 0x2d2832, roughness: 1 });

  for (let i = 0; i < 2; i += 1) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.9, 1.05), crate);
    box.position.set(i === 0 ? -0.35 : 0.38, 0.45 + i * 0.18, i * 0.1);
    box.rotation.y = i === 0 ? 0.08 : -0.12;
    group.add(box);
  }

  const band = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.08, 1.12), strap);
  band.position.y = 0.57;
  group.add(band);
  return group;
}

export function createSpark(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xfff1a8,
    emissive: 0xffce54,
    emissiveIntensity: 2.5,
    roughness: 0.4,
  });

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), material);
  core.rotation.z = Math.PI / 4;
  group.add(core);
  return group;
}

export function createStreetSegment(z: number, segmentIndex: number): THREE.Group {
  const group = new THREE.Group();
  group.position.z = z;

  const road = new THREE.Mesh(new THREE.BoxGeometry(11, 0.18, 18), roadMaterial);
  road.position.y = -0.12;
  group.add(road);

  for (const side of [-1, 1]) {
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 18), sidewalkMaterial);
    sidewalk.position.set(side * 7.25, 0, 0);
    group.add(sidewalk);

    for (let i = 0; i < 2; i += 1) {
      const house = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.1 + ((segmentIndex + i) % 2), 6.2), houseMaterial);
      house.position.set(side * 9.4, 2.15, -4.1 + i * 8.2);
      group.add(house);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.55, 1.25, 4), roofMaterial);
      roof.position.set(side * 9.4, house.position.y + 2.55, house.position.z);
      roof.rotation.y = Math.PI / 4;
      group.add(roof);

      const lamp = createLantern(lanternColors[(segmentIndex + i) % lanternColors.length], 0.52);
      lamp.position.set(side * 7.55, 3.1, house.position.z + 1.2);
      lamp.rotation.y = side < 0 ? Math.PI : 0;
      group.add(lamp);
    }
  }

  for (const x of [-3.65, 3.65]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 18), new THREE.MeshStandardMaterial({ color: 0xd9b56a }));
    curb.position.set(x, 0.12, 0);
    group.add(curb);
  }

  return group;
}

export function createMoon(): THREE.Group {
  const group = new THREE.Group();
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(7.6, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffdc7a, transparent: true, opacity: 0.1 }),
  );
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xffe9aa }),
  );
  group.add(halo, moon);
  return group;
}

export function createStarField(count = 260): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    positions[offset] = (Math.random() - 0.5) * 180;
    positions[offset + 1] = 10 + Math.random() * 70;
    positions[offset + 2] = -20 - Math.random() * 160;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xfff3ce, size: 0.28, transparent: true, opacity: 0.85 });
  return new THREE.Points(geometry, material);
}

export function randomLanternColor(): number {
  return lanternColors[Math.floor(Math.random() * lanternColors.length)] ?? 0xff5c58;
}
