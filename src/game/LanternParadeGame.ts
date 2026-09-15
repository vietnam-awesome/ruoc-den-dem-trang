import { Application, Container, Graphics } from 'pixi.js';
import {
  createCharacter,
  createCloud,
  createMoon,
  createMooncake,
  createObstacle,
  createSceneryRow,
  createSpark,
  type CharacterArt,
} from './objects';

const GAME_DURATION = 75;
const FULL_MOON_TARGET = 18;
const MAX_VISIBLE_FOLLOWERS = 18;
const HISTORY_LIMIT = 320;
const STEER_STEP = 0.34;

type EntityKind = 'recruit' | 'mooncake' | 'spark' | 'obstacle';

type Entity = {
  object: Container;
  kind: EntityKind;
  xNorm: number;
  depth: number;
  collected: boolean;
  phase: number;
};

type SceneryRow = {
  object: Container;
  depth: number;
};

type Firefly = {
  object: Graphics;
  x: number;
  y: number;
  phase: number;
  speed: number;
};

type Burst = {
  object: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

type TrailPoint = {
  xNorm: number;
  t: number;
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
  private readonly app = new Application();
  private readonly world = new Container();
  private readonly background = new Graphics();
  private readonly stars = new Graphics();
  private readonly road = new Graphics();
  private readonly moon = createMoon();
  private readonly clouds = [createCloud(0), createCloud(1), createCloud(2), createCloud(3)];
  private readonly fullMoonGlow = new Graphics();
  private readonly paradeRibbon = new Graphics();
  private readonly sceneryRows: SceneryRow[] = [];
  private readonly entities: Entity[] = [];
  private readonly followers: CharacterArt[] = [];
  private readonly player = createCharacter(0, true);
  private readonly fireflies: Firefly[] = [];
  private readonly bursts: Burst[] = [];
  private readonly trail: TrailPoint[] = [];
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly ready: Promise<void>;

  private initialized = false;
  private pendingStart = false;
  private running = false;
  private targetX = 0;
  private visualX = 0;
  private elapsed = 0;
  private spawnAccumulator = 0;
  private score = 0;
  private lanterns = 0;
  private mooncakes = 0;
  private combo = 0;
  private fullMoon = false;
  private nextHudAt = 0;
  private width = 1;
  private height = 1;
  private worldScale = 1;
  private idleTime = 0;

  constructor(canvasHost: HTMLElement, events: GameEvents) {
    this.canvasHost = canvasHost;
    this.events = events;
    this.ready = this.initialize();
  }

  start(): void {
    if (!this.initialized) {
      this.pendingStart = true;
      return;
    }
    this.startRun();
  }

  moveLeft(): void {
    if (!this.running) return;
    this.targetX = Math.max(-1, this.targetX - STEER_STEP);
  }

  moveRight(): void {
    if (!this.running) return;
    this.targetX = Math.min(1, this.targetX + STEER_STEP);
  }

  isRunning(): boolean {
    return this.running;
  }

  dispose(): void {
    window.removeEventListener('resize', this.resize);
    void this.ready.finally(() => {
      this.app.ticker.remove(this.animate);
      this.app.destroy(true);
    });
  }

  private async initialize(): Promise<void> {
    await this.app.init({
      resizeTo: this.canvasHost,
      backgroundColor: 0x071326,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    this.app.canvas.setAttribute('aria-label', 'Rước Đèn Đêm Trăng kiểu rồng rắn lên mây');
    this.canvasHost.appendChild(this.app.canvas);

    this.world.sortableChildren = true;
    this.app.stage.addChild(this.world);

    this.background.zIndex = -1000;
    this.stars.zIndex = -950;
    this.moon.zIndex = -900;
    this.fullMoonGlow.zIndex = -850;
    this.road.zIndex = -800;
    this.paradeRibbon.zIndex = 8700;
    this.world.addChild(this.background, this.stars, this.fullMoonGlow, this.moon, this.road, this.paradeRibbon);

    for (const cloud of this.clouds) {
      cloud.zIndex = -880;
      this.world.addChild(cloud);
    }

    for (let i = 0; i < 8; i += 1) {
      const row = createSceneryRow(i);
      const depth = 0.04 + (i / 8) * 0.78;
      this.sceneryRows.push({ object: row, depth });
      this.world.addChild(row);
    }

    this.player.zIndex = 10000;
    this.world.addChild(this.player);
    this.createFireflies();

    this.resize();
    window.addEventListener('resize', this.resize);
    this.app.ticker.add(this.animate);
    this.initialized = true;

    if (this.pendingStart) {
      this.pendingStart = false;
      this.startRun();
    }
  }

  private startRun(): void {
    this.resetRun();
    this.running = true;
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
    this.targetX = 0;
    this.visualX = 0;
    this.fullMoonGlow.alpha = 0;
    this.trail.length = 0;

    for (const entity of this.entities) entity.object.destroy({ children: true });
    this.entities.length = 0;

    for (const follower of this.followers) follower.destroy({ children: true });
    this.followers.length = 0;

    for (const burst of this.bursts) burst.object.destroy();
    this.bursts.length = 0;

    this.seedTrail();
    this.layoutParade(0);
    this.events.onTick(this.snapshot());
  }

  private seedTrail(): void {
    for (let i = 0; i < 140; i += 1) {
      this.trail.push({ xNorm: 0, t: -i * 0.016 });
    }
  }

  private readonly resize = (): void => {
    if (!this.initialized && !this.app.renderer) return;
    this.width = Math.max(this.canvasHost.clientWidth || window.innerWidth, 1);
    this.height = Math.max(this.canvasHost.clientHeight || window.innerHeight, 1);
    this.worldScale = Math.min(this.width / 900, this.height / 720);
    this.redrawStaticScene();
    this.layoutScenery();
    this.layoutParade(this.running ? this.elapsed : this.idleTime);
  };

  private readonly animate = (): void => {
    const delta = Math.min(this.app.ticker.deltaMS / 1000, 0.05);
    this.idleTime += delta;

    if (this.running) this.update(delta);
    else this.updateIdle(delta);

    this.updateBursts(delta);
    this.updateFireflies(delta);
  };

  private update(delta: number): void {
    this.elapsed += delta;
    const secondsLeft = Math.max(0, GAME_DURATION - this.elapsed);
    const speedFactor = 1 + Math.min(this.elapsed * 0.0045, 0.28) + (this.fullMoon ? 0.08 : 0);
    const steerEase = 1 - Math.exp(-delta * 7.2);
    this.visualX += (this.targetX - this.visualX) * steerEase;

    const naturalSway = this.reducedMotion ? 0 : Math.sin(this.elapsed * 2.15) * 0.018;
    this.pushTrail(Math.max(-1, Math.min(1, this.visualX + naturalSway)));

    this.score += delta * 33 * speedFactor * (this.fullMoon ? 1.6 : 1);
    this.spawnAccumulator += delta;

    const spawnEvery = Math.max(0.5, 0.84 - this.elapsed * 0.0025);
    if (this.spawnAccumulator >= spawnEvery) {
      this.spawnAccumulator = 0;
      this.spawnEntity();
    }

    this.updateScenery(delta, speedFactor);
    this.updateEntities(delta, speedFactor);
    this.layoutParade(this.elapsed);

    if (this.elapsed >= this.nextHudAt) {
      this.nextHudAt = this.elapsed + 0.08;
      this.events.onTick(this.snapshot());
    }

    if (secondsLeft <= 0) this.endGame('time');
  }

  private updateIdle(delta: number): void {
    const idleTarget = Math.sin(this.idleTime * 0.75) * 0.38;
    this.visualX += (idleTarget - this.visualX) * (1 - Math.exp(-delta * 2.2));
    this.pushTrail(this.visualX);
    this.updateScenery(delta, 0.16);
    this.layoutParade(this.idleTime);
    this.moon.rotation = Math.sin(this.idleTime * 0.12) * 0.012;
  }

  private pushTrail(xNorm: number): void {
    this.trail.unshift({ xNorm, t: this.elapsed });
    if (this.trail.length > HISTORY_LIMIT) this.trail.length = HISTORY_LIMIT;
  }

  private updateScenery(delta: number, speedFactor: number): void {
    const rate = delta * 0.075 * speedFactor;
    for (const row of this.sceneryRows) {
      row.depth += rate;
      if (row.depth > 0.86) row.depth = 0.025;
      this.layoutSceneryRow(row);
    }

    this.clouds.forEach((cloud, index) => {
      cloud.x += delta * (3 + index * 1.2);
      if (cloud.x > this.width + 180) cloud.x = -180;
    });
  }

  private updateEntities(delta: number, speedFactor: number): void {
    const depthRate = delta * (0.205 + Math.min(this.elapsed * 0.00065, 0.04)) * speedFactor;
    const headX = this.trail[0]?.xNorm ?? this.visualX;

    for (let i = this.entities.length - 1; i >= 0; i -= 1) {
      const entity = this.entities[i];
      if (!entity) continue;

      entity.depth += depthRate;
      entity.phase += delta;
      this.layoutEntity(entity);

      const horizontalDistance = Math.abs(entity.xNorm - headX);
      if (!entity.collected && entity.depth >= 0.79 && entity.depth <= 0.94 && horizontalDistance < 0.21) {
        if (entity.kind === 'obstacle') {
          entity.collected = true;
          this.burstAt(entity.object.x, entity.object.y - 20 * entity.object.scale.y, 0xff655f, 15);
          this.endGame('obstacle');
          return;
        }
        this.collect(entity);
      }

      if (entity.depth > 1.06 || entity.collected) {
        entity.object.destroy({ children: true });
        this.entities.splice(i, 1);
      }
    }
  }

  private spawnEntity(): void {
    const xNorm = -0.9 + Math.random() * 1.8;
    const roll = Math.random();

    let kind: EntityKind;
    let object: Container;

    if (roll < 0.4) {
      kind = 'recruit';
      object = createCharacter(this.lanterns + this.entities.length + 1, true);
    } else if (roll < 0.65) {
      kind = 'mooncake';
      object = createMooncake();
    } else if (roll < 0.82) {
      kind = 'spark';
      object = createSpark();
    } else {
      kind = 'obstacle';
      object = createObstacle();
    }

    const entity: Entity = {
      object,
      kind,
      xNorm,
      depth: 0.015,
      collected: false,
      phase: Math.random() * Math.PI * 2,
    };

    this.world.addChild(object);
    this.entities.push(entity);
    this.layoutEntity(entity);

    if (kind !== 'obstacle' && Math.random() < 0.2) {
      const extraKind: EntityKind = Math.random() < 0.55 ? 'mooncake' : 'spark';
      const extraObject = extraKind === 'mooncake' ? createMooncake() : createSpark();
      const offset = Math.random() < 0.5 ? -0.46 : 0.46;
      const extra: Entity = {
        object: extraObject,
        kind: extraKind,
        xNorm: Math.max(-0.92, Math.min(0.92, xNorm + offset)),
        depth: -0.12,
        collected: false,
        phase: Math.random() * Math.PI * 2,
      };
      this.world.addChild(extraObject);
      this.entities.push(extra);
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
      this.burstAt(entity.object.x, entity.object.y - 22, 0xffb64f, 13);
      this.events.onCollect('recruit');
    } else if (entity.kind === 'mooncake') {
      this.mooncakes += 1;
      this.score += 60 * comboBonus;
      this.burstAt(entity.object.x, entity.object.y, 0xffc86a, 10);
      this.events.onCollect('mooncake');
    } else if (entity.kind === 'spark') {
      this.score += 42 * comboBonus;
      this.burstAt(entity.object.x, entity.object.y, 0xffec91, 9);
      this.events.onCollect('spark');
    }

    if (!this.fullMoon && this.lanterns >= FULL_MOON_TARGET) {
      this.fullMoon = true;
      this.fullMoonGlow.alpha = 1;
      this.burstAt(this.width * 0.72, this.height * 0.16, 0xffecac, 24);
      this.events.onFullMoon();
    }

    this.events.onTick(this.snapshot());
  }

  private addFollower(): void {
    if (this.followers.length >= MAX_VISIBLE_FOLLOWERS) return;
    const follower = createCharacter(this.followers.length + 1, true);
    this.followers.push(follower);
    this.world.addChild(follower);
  }

  private layoutParade(time: number): void {
    if (!this.width || !this.height) return;

    const headDepth = 0.82;
    const headXNorm = this.trail[0]?.xNorm ?? this.visualX;
    const head = this.project(headDepth, headXNorm);
    const bounce = this.reducedMotion ? 0 : Math.abs(Math.sin(time * 6.5)) * 4 * this.worldScale;

    this.player.position.set(head.x, head.y - bounce);
    this.player.scale.set(head.scale * 0.9);
    this.player.rotation = this.reducedMotion ? 0 : Math.sin(time * 6.5) * 0.02;
    this.player.zIndex = head.y + 1000;
    if (this.player.lanternArt && !this.reducedMotion) this.player.lanternArt.rotation = Math.sin(time * 4.4) * 0.055;

    const ribbonPoints: Array<{ x: number; y: number }> = [{ x: head.x, y: head.y - 18 * head.scale }];

    this.followers.forEach((follower, index) => {
      const historyIndex = Math.min(this.trail.length - 1, 9 + index * 11);
      const traceX = this.trail[historyIndex]?.xNorm ?? 0;
      const depth = Math.max(0.28, headDepth - (index + 1) * 0.035);
      const projected = this.project(depth, traceX);
      const followerBounce = this.reducedMotion ? 0 : Math.abs(Math.sin(time * 6.15 + follower.bobSeed)) * 3 * projected.scale;

      follower.position.set(projected.x, projected.y - followerBounce);
      follower.scale.set(projected.scale * 0.82);
      follower.rotation = this.reducedMotion ? 0 : Math.sin(time * 6.1 + follower.bobSeed) * 0.018;
      follower.zIndex = projected.y + 20;
      if (follower.lanternArt && !this.reducedMotion) follower.lanternArt.rotation = Math.sin(time * 4.1 + index) * 0.05;

      ribbonPoints.push({ x: projected.x, y: projected.y - 15 * projected.scale });
    });

    this.drawParadeRibbon(ribbonPoints);
  }

  private drawParadeRibbon(points: Array<{ x: number; y: number }>): void {
    this.paradeRibbon.clear();
    if (points.length < 2) return;

    this.paradeRibbon.moveTo(points[0]?.x ?? 0, points[0]?.y ?? 0);
    for (let i = 1; i < points.length; i += 1) {
      const point = points[i];
      if (point) this.paradeRibbon.lineTo(point.x, point.y);
    }
    this.paradeRibbon.stroke({ color: 0xffd36a, width: 8 * this.worldScale, alpha: 0.08 });

    this.paradeRibbon.moveTo(points[0]?.x ?? 0, points[0]?.y ?? 0);
    for (let i = 1; i < points.length; i += 1) {
      const point = points[i];
      if (point) this.paradeRibbon.lineTo(point.x, point.y);
    }
    this.paradeRibbon.stroke({ color: 0xffe59b, width: 2 * this.worldScale, alpha: 0.32 });
  }

  private layoutEntity(entity: Entity): void {
    const depth = Math.max(-0.06, entity.depth);
    const projected = this.project(depth, entity.xNorm);
    const bob = entity.kind === 'obstacle' || this.reducedMotion ? 0 : Math.sin(entity.phase * 4.1) * 5 * projected.scale;
    const sizeMultiplier = entity.kind === 'recruit' ? 0.8 : entity.kind === 'obstacle' ? 0.95 : 1.08;

    entity.object.position.set(projected.x, projected.y - bob);
    entity.object.scale.set(projected.scale * sizeMultiplier);
    entity.object.zIndex = projected.y + 12;

    if (!this.reducedMotion && entity.kind !== 'obstacle') {
      entity.object.rotation = Math.sin(entity.phase * 2.5) * 0.04;
    }
  }

  private project(depth: number, xNorm: number): { x: number; y: number; scale: number } {
    const t = Math.max(0, Math.min(1, depth));
    const eased = Math.pow(t, 1.28);
    const horizonY = this.height * 0.235;
    const bottomY = this.height * 0.94;
    const roadHalf = this.width * (0.07 + 0.39 * eased);
    const scale = Math.max(0.12, this.worldScale * (0.18 + 0.92 * eased));
    return {
      x: this.width / 2 + xNorm * roadHalf,
      y: horizonY + (bottomY - horizonY) * eased,
      scale,
    };
  }

  private layoutScenery(): void {
    for (const row of this.sceneryRows) this.layoutSceneryRow(row);
  }

  private layoutSceneryRow(row: SceneryRow): void {
    const t = Math.max(0, Math.min(1, row.depth));
    const eased = Math.pow(t, 1.22);
    const horizonY = this.height * 0.235;
    const y = horizonY + this.height * 0.69 * eased;
    const scale = this.worldScale * (0.12 + 0.76 * eased);
    row.object.position.set(this.width / 2, y);
    row.object.scale.set(scale);
    row.object.alpha = 0.42 + t * 0.58;
    row.object.zIndex = y - 10;
  }

  private redrawStaticScene(): void {
    const width = this.width;
    const height = this.height;
    const horizonY = height * 0.235;

    this.background.clear();
    this.background.rect(0, 0, width, height).fill(0x061225);
    this.background.rect(0, 0, width, height * 0.47).fill({ color: 0x17345e, alpha: 0.4 });
    this.background.circle(width * 0.72, height * 0.17, Math.max(width, height) * 0.26).fill({ color: 0x36538b, alpha: 0.07 });
    this.background.rect(0, horizonY - 20, width, height * 0.25).fill({ color: 0x543550, alpha: 0.08 });

    this.stars.clear();
    const starCount = this.reducedMotion ? 80 : 150;
    for (let i = 0; i < starCount; i += 1) {
      const x = ((i * 83.17) % 1000) / 1000 * width;
      const y = (((i * 47.31 + 117) % 1000) / 1000) * height * 0.46;
      const radius = 0.7 + ((i * 13) % 5) * 0.28;
      this.stars.circle(x, y, radius).fill({ color: 0xfff2c7, alpha: 0.35 + ((i * 29) % 60) / 100 });
    }

    this.fullMoonGlow.clear();
    this.fullMoonGlow.rect(0, 0, width, height).fill({ color: 0xffd885, alpha: 0.055 });
    this.fullMoonGlow.alpha = this.fullMoon ? 1 : 0;

    this.road.clear();
    const roadTopHalf = width * 0.085;
    const roadBottomHalf = Math.min(width * 0.47, 430);
    this.road.poly([
      width / 2 - roadTopHalf,
      horizonY,
      width / 2 + roadTopHalf,
      horizonY,
      width / 2 + roadBottomHalf,
      height,
      width / 2 - roadBottomHalf,
      height,
    ]).fill(0x1a2943);

    this.road.poly([
      width / 2 - roadTopHalf - width * 0.035,
      horizonY,
      width / 2 - roadTopHalf,
      horizonY,
      width / 2 - roadBottomHalf,
      height,
      Math.max(0, width / 2 - roadBottomHalf - width * 0.08),
      height,
    ]).fill(0x55566a);

    this.road.poly([
      width / 2 + roadTopHalf,
      horizonY,
      width / 2 + roadTopHalf + width * 0.035,
      horizonY,
      Math.min(width, width / 2 + roadBottomHalf + width * 0.08),
      height,
      width / 2 + roadBottomHalf,
      height,
    ]).fill(0x55566a);

    for (let i = 0; i < 7; i += 1) {
      const y = horizonY + (height - horizonY) * ((i + 1) / 8);
      const alpha = 0.03 + i * 0.01;
      this.road.moveTo(width * 0.23, y).lineTo(width * 0.77, y).stroke({ color: 0xffd98b, width: 1, alpha });
    }

    this.moon.position.set(width * (width < 700 ? 0.75 : 0.72), height * (width < 700 ? 0.17 : 0.155));
    this.moon.scale.set(Math.max(0.72, this.worldScale * 1.02));

    const cloudPositions = [
      [0.11, 0.17, 0.92],
      [0.38, 0.1, 0.62],
      [0.64, 0.27, 0.76],
      [0.88, 0.12, 0.55],
    ] as const;
    this.clouds.forEach((cloud, index) => {
      const position = cloudPositions[index] ?? cloudPositions[0];
      cloud.position.set(width * position[0], height * position[1]);
      cloud.scale.set(this.worldScale * position[2]);
    });
  }

  private createFireflies(): void {
    const count = this.reducedMotion ? 10 : 26;
    for (let i = 0; i < count; i += 1) {
      const object = new Graphics();
      const radius = 1.4 + (i % 3) * 0.65;
      object.circle(0, 0, radius * 3.2).fill({ color: 0xffd977, alpha: 0.035 });
      object.circle(0, 0, radius).fill({ color: 0xffec9f, alpha: 0.72 });
      object.zIndex = 9000;
      this.world.addChild(object);
      this.fireflies.push({
        object,
        x: ((i * 71.3) % 100) / 100,
        y: 0.36 + (((i * 43.1) % 100) / 100) * 0.5,
        phase: i * 0.91,
        speed: 0.55 + (i % 5) * 0.12,
      });
    }
  }

  private updateFireflies(delta: number): void {
    for (const firefly of this.fireflies) {
      firefly.phase += delta * firefly.speed;
      const driftX = Math.sin(firefly.phase * 1.4) * 18;
      const driftY = Math.cos(firefly.phase * 1.9) * 11;
      firefly.object.position.set(firefly.x * this.width + driftX, firefly.y * this.height + driftY);
      firefly.object.alpha = 0.38 + (Math.sin(firefly.phase * 3.2) + 1) * 0.27;
    }
  }

  private burstAt(x: number, y: number, color: number, count: number): void {
    if (this.reducedMotion) return;
    for (let i = 0; i < count; i += 1) {
      const object = new Graphics();
      const radius = 1.8 + Math.random() * 3.3;
      object.circle(0, 0, radius * 3).fill({ color, alpha: 0.05 });
      object.circle(0, 0, radius).fill({ color, alpha: 0.92 });
      object.position.set(x, y);
      object.zIndex = 12000;
      this.world.addChild(object);
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
      const speed = 45 + Math.random() * 95;
      const maxLife = 0.42 + Math.random() * 0.38;
      this.bursts.push({
        object,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 25,
        life: maxLife,
        maxLife,
      });
    }
  }

  private updateBursts(delta: number): void {
    for (let i = this.bursts.length - 1; i >= 0; i -= 1) {
      const burst = this.bursts[i];
      if (!burst) continue;
      burst.life -= delta;
      burst.object.x += burst.vx * delta;
      burst.object.y += burst.vy * delta;
      burst.vy += 80 * delta;
      burst.object.alpha = Math.max(0, burst.life / burst.maxLife);
      if (burst.life <= 0) {
        burst.object.destroy();
        this.bursts.splice(i, 1);
      }
    }
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
