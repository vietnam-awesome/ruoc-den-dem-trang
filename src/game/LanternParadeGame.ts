import * as THREE from 'three';
import {
  createCharacter,
  createCloudLayer,
  createFireflyField,
  createMoon,
  createMooncake,
  createObstacle,
  createSpark,
  createStarField,
  createStreetSegment,
} from './objects';

const LANES = [-3, 0, 3] as const;
const GAME_DURATION = 75;
const FULL_MOON_TARGET = 18;
const PLAYER_Z = 1;
const SPAWN_Z = -68;

type EntityKind = 'recruit' | 'mooncake' | 'spark' | 'obstacle';

type Entity = {
  object: THREE.Group;
  kind: EntityKind;
  lane: number;
  collected: boolean;
};

export type GameSnapshot = {
  score: number;
  lanterns: number;
  mooncakes: number;
  combo: number;
  secondsLeft: number;
  moonProgress: number;
  fullMoon: boolean;
};

export type GameResult = GameSnapshot & {
  bestScore: number;
  reason: 'time' | 'obstacle';
};

type GameEvents = {
  onTick: (snapshot: GameSnapshot) => void;
  onEnd: (result: GameResult) => void;
  onCollect: (kind: Exclude<EntityKind, 'obstacle'>) => void;
  onFullMoon: () => void;
};

export class LanternParadeGame {
  private readonly canvasHost: HTMLElement;
  private readonly events: GameEvents;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 240);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock = new THREE.Clock();
  private readonly player = createCharacter(0, true);
  private readonly parade = new THREE.Group();
  private readonly entities: Entity[] = [];
  private readonly streetSegments: THREE.Group[] = [];
  private readonly followers: THREE.Group[] = [];
  private readonly ambientLight = new THREE.HemisphereLight(0x7396ce, 0x1b1017, 1.28);
  private readonly moonLight = new THREE.DirectionalLight(0xffdda2, 2.15);
  private readonly lanternLight = new THREE.PointLight(0xff8d45, 9, 15, 2);
  private readonly rimLight = new THREE.PointLight(0x5578ff, 7, 30, 2);
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private running = false;
  private laneIndex = 1;
  private targetX: number = LANES[1];
  private elapsed = 0;
  private spawnAccumulator = 0;
  private score = 0;
  private lanterns = 0;
  private mooncakes = 0;
  private combo = 0;
  private fullMoon = false;
  private nextHudAt = 0;

  constructor(canvasHost: HTMLElement, events: GameEvents) {
    this.canvasHost = canvasHost;
    this.events = events;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.domElement.setAttribute('aria-label', 'Khung cảnh game 3D Rước Đèn Đêm Trăng');
    this.canvasHost.appendChild(this.renderer.domElement);

    this.setupScene();
    this.resize();
    window.addEventListener('resize', this.resize);
    this.renderer.setAnimationLoop(this.animate);
  }

  start(): void {
    this.resetRun();
    this.running = true;
    this.clock.start();
  }

  moveLeft(): void {
    if (!this.running) return;
    this.laneIndex = Math.max(0, this.laneIndex - 1);
    this.targetX = LANES[this.laneIndex] ?? 0;
  }

  moveRight(): void {
    if (!this.running) return;
    this.laneIndex = Math.min(LANES.length - 1, this.laneIndex + 1);
    this.targetX = LANES[this.laneIndex] ?? 0;
  }

  isRunning(): boolean {
    return this.running;
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.resize);
    this.renderer.dispose();
    this.canvasHost.replaceChildren();
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color(0x030a18);
    this.scene.fog = new THREE.FogExp2(0x07101f, 0.0118);

    this.camera.position.set(0, 5.6, 11.8);
    this.camera.lookAt(0, 1.45, -13);

    this.moonLight.position.set(-16, 23, -25);
    this.lanternLight.position.set(0.8, 2.35, 2.2);
    this.rimLight.position.set(-6.5, 8, 3);
    this.scene.add(this.ambientLight, this.moonLight, this.lanternLight, this.rimLight);

    const moon = createMoon();
    moon.position.set(-18, 25, -108);
    this.scene.add(moon);
    this.scene.add(createStarField(this.reducedMotion ? 130 : 320));
    this.scene.add(createFireflyField(this.reducedMotion ? 34 : 82));
    this.scene.add(createCloudLayer());

    this.parade.add(this.player);
    this.parade.position.set(0, 0, PLAYER_Z);
    this.scene.add(this.parade);

    for (let i = 0; i < 7; i += 1) {
      const segment = createStreetSegment(11 - i * 18, i);
      this.streetSegments.push(segment);
      this.scene.add(segment);
    }

    const laneMarkers = new THREE.Group();
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe9c873, transparent: true, opacity: 0.085 });
    for (const x of [-1.5, 1.5]) {
      for (let z = -75; z < 14; z += 6) {
        const marker = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, 2.1), markerMaterial);
        marker.position.set(x, 0.025, z);
        laneMarkers.add(marker);
      }
    }
    this.scene.add(laneMarkers);
  }

  private resetRun(): void {
    this.running = false;
    this.elapsed = 0;
    this.spawnAccumulator = 0;
    this.score = 0;
    this.lanterns = 0;
    this.mooncakes = 0;
    this.combo = 0;
    this.fullMoon = false;
    this.nextHudAt = 0;
    this.laneIndex = 1;
    this.targetX = 0;
    this.parade.position.x = 0;
    this.camera.position.x = 0;
    this.ambientLight.intensity = 1.28;
    this.moonLight.intensity = 2.15;
    this.lanternLight.intensity = 9;
    this.rimLight.intensity = 7;
    this.renderer.toneMappingExposure = 1.14;

    for (const entity of this.entities) this.scene.remove(entity.object);
    this.entities.length = 0;

    for (const follower of this.followers) this.parade.remove(follower);
    this.followers.length = 0;

    this.events.onTick(this.snapshot());
  }

  private readonly resize = (): void => {
    const width = this.canvasHost.clientWidth || window.innerWidth;
    const height = this.canvasHost.clientHeight || window.innerHeight;
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly animate = (): void => {
    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);

    if (this.running) this.update(delta);
    else this.updateIdle(delta);

    this.renderer.render(this.scene, this.camera);
  };

  private update(delta: number): void {
    this.elapsed += delta;
    const secondsLeft = Math.max(0, GAME_DURATION - this.elapsed);
    const speed = 13.5 + Math.min(this.elapsed * 0.055, 4.8) + (this.fullMoon ? 1.4 : 0);

    this.score += delta * speed * (this.fullMoon ? 4.2 : 2.6);
    this.spawnAccumulator += delta;

    const spawnEvery = Math.max(0.48, 0.82 - this.elapsed * 0.0025);
    if (this.spawnAccumulator >= spawnEvery) {
      this.spawnAccumulator = 0;
      this.spawnEntity();
    }

    const easing = 1 - Math.exp(-delta * 12);
    this.parade.position.x = THREE.MathUtils.lerp(this.parade.position.x, this.targetX, easing);
    this.animateParade(this.elapsed);
    this.updateCamera(delta);
    this.updateStreet(speed, delta);
    this.updateEntities(speed, delta);

    if (this.elapsed >= this.nextHudAt) {
      this.nextHudAt = this.elapsed + 0.08;
      this.events.onTick(this.snapshot());
    }

    if (secondsLeft <= 0) this.endGame('time');
  }

  private updateIdle(delta: number): void {
    const t = performance.now() * 0.001;
    this.player.rotation.y = Math.sin(t * 0.7) * 0.05;
    this.player.position.y = Math.sin(t * 1.8) * 0.03;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, Math.sin(t * 0.22) * 0.34, 0.025);
    this.camera.position.y = 5.6 + Math.sin(t * 0.35) * 0.045;
    this.camera.lookAt(0, 1.45, -13);
    this.updateStreet(1.1, delta);
  }

  private updateCamera(delta: number): void {
    if (this.reducedMotion) return;
    const follow = 1 - Math.exp(-delta * 4.2);
    const targetCameraX = this.parade.position.x * 0.16;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCameraX, follow);
    this.camera.position.y = 5.6 + Math.sin(this.elapsed * 2.1) * 0.025;
    this.camera.lookAt(this.parade.position.x * 0.06, 1.45, -13);
    this.lanternLight.position.x = this.parade.position.x + 0.8;
  }

  private updateStreet(speed: number, delta: number): void {
    let minZ = Infinity;
    for (const segment of this.streetSegments) minZ = Math.min(minZ, segment.position.z);

    for (const segment of this.streetSegments) {
      segment.position.z += speed * delta;
      if (segment.position.z > 25) {
        segment.position.z = minZ - 18;
        minZ = segment.position.z;
      }
    }
  }

  private updateEntities(speed: number, delta: number): void {
    const playerX = this.parade.position.x;

    for (let i = this.entities.length - 1; i >= 0; i -= 1) {
      const entity = this.entities[i];
      if (!entity) continue;

      entity.object.position.z += speed * delta;
      entity.object.rotation.y += delta * (entity.kind === 'obstacle' ? 0 : entity.kind === 'recruit' ? 0.22 : 1.15);
      if (entity.kind !== 'obstacle') entity.object.position.y = 1.25 + Math.sin(this.elapsed * 4 + i) * 0.1;

      if (!entity.collected && Math.abs(entity.object.position.z - PLAYER_Z) < 1.35 && Math.abs(entity.object.position.x - playerX) < 1.2) {
        if (entity.kind === 'obstacle') {
          entity.collected = true;
          this.endGame('obstacle');
          return;
        }
        this.collect(entity);
      }

      if (entity.object.position.z > 18 || entity.collected) {
        this.scene.remove(entity.object);
        this.entities.splice(i, 1);
      }
    }
  }

  private spawnEntity(): void {
    const laneIndex = Math.floor(Math.random() * LANES.length);
    const lane = LANES[laneIndex] ?? 0;
    const roll = Math.random();

    let kind: EntityKind;
    let object: THREE.Group;

    if (roll < 0.39) {
      kind = 'recruit';
      object = createCharacter(this.lanterns + laneIndex + 1, true);
      object.scale.setScalar(0.72);
    } else if (roll < 0.64) {
      kind = 'mooncake';
      object = createMooncake();
    } else if (roll < 0.82) {
      kind = 'spark';
      object = createSpark();
    } else {
      kind = 'obstacle';
      object = createObstacle();
    }

    object.position.set(lane, kind === 'obstacle' ? 0 : 1.25, SPAWN_Z);
    this.scene.add(object);
    this.entities.push({ object, kind, lane, collected: false });

    if (kind !== 'obstacle' && Math.random() < 0.18) {
      const extraLaneIndex = (laneIndex + 1 + Math.floor(Math.random() * 2)) % LANES.length;
      const extraLane = LANES[extraLaneIndex] ?? 0;
      const extraIsMooncake = Math.random() < 0.55;
      const extra = extraIsMooncake ? createMooncake() : createSpark();
      extra.position.set(extraLane, 1.25, SPAWN_Z - 5.5);
      this.scene.add(extra);
      this.entities.push({ object: extra, kind: extraIsMooncake ? 'mooncake' : 'spark', lane: extraLane, collected: false });
    }
  }

  private collect(entity: Entity): void {
    entity.collected = true;
    this.combo = Math.min(this.combo + 1, 20);
    const comboBonus = 1 + Math.floor(this.combo / 4) * 0.25;

    if (entity.kind === 'recruit') {
      this.lanterns += 1;
      this.score += 90 * comboBonus;
      this.addFollower();
      this.events.onCollect('recruit');
    } else if (entity.kind === 'mooncake') {
      this.mooncakes += 1;
      this.score += 60 * comboBonus;
      this.events.onCollect('mooncake');
    } else if (entity.kind === 'spark') {
      this.score += 42 * comboBonus;
      this.events.onCollect('spark');
    }

    if (!this.fullMoon && this.lanterns >= FULL_MOON_TARGET) {
      this.fullMoon = true;
      this.ambientLight.intensity = 1.7;
      this.moonLight.intensity = 3.25;
      this.lanternLight.intensity = 13;
      this.rimLight.intensity = 10;
      this.renderer.toneMappingExposure = 1.23;
      this.events.onFullMoon();
    }

    this.events.onTick(this.snapshot());
  }

  private addFollower(): void {
    if (this.followers.length >= 7) return;
    const follower = createCharacter(this.followers.length + 1, true);
    follower.scale.setScalar(0.68);
    const index = this.followers.length;
    follower.position.set(index % 2 === 0 ? -0.62 : 0.62, 0, 1.65 + index * 1.18);
    follower.rotation.y = (index % 2 === 0 ? -1 : 1) * 0.06;
    this.followers.push(follower);
    this.parade.add(follower);
  }

  private animateParade(time: number): void {
    this.player.position.y = Math.abs(Math.sin(time * 7.2)) * 0.055;
    this.player.rotation.z = Math.sin(time * 7.2) * 0.025;

    this.followers.forEach((follower, index) => {
      follower.position.y = Math.abs(Math.sin(time * 7 + index * 0.8)) * 0.045;
      follower.rotation.z = Math.sin(time * 7 + index) * 0.02;
    });
  }

  private endGame(reason: GameResult['reason']): void {
    if (!this.running) return;
    this.running = false;
    this.combo = 0;
    const score = Math.floor(this.score);
    const previousBest = Number(localStorage.getItem('lantern-parade-best') ?? 0);
    const bestScore = Math.max(previousBest, score);
    localStorage.setItem('lantern-parade-best', String(bestScore));
    this.events.onTick(this.snapshot());
    this.events.onEnd({ ...this.snapshot(), bestScore, reason });
  }

  private snapshot(): GameSnapshot {
    return {
      score: Math.floor(this.score),
      lanterns: this.lanterns,
      mooncakes: this.mooncakes,
      combo: this.combo,
      secondsLeft: Math.max(0, Math.ceil(GAME_DURATION - this.elapsed)),
      moonProgress: Math.min(1, this.lanterns / FULL_MOON_TARGET),
      fullMoon: this.fullMoon,
    };
  }
}
