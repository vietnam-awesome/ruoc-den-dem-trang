import { AnimatedSprite, Assets, Container, Graphics, type Texture } from 'pixi.js';
import { createStarLantern } from './objectsLegacy';

const RAW_BASE = 'https://raw.githubusercontent.com/shorepine/kenney/main/2d/Toon%20Characters';

const PROFILES = [
  { folder: 'Female%20person', prefix: 'femalePerson' },
  { folder: 'Male%20person', prefix: 'malePerson' },
  { folder: 'Female%20adventurer', prefix: 'femaleAdventurer' },
  { folder: 'Male%20adventurer', prefix: 'maleAdventurer' },
] as const;

const FRAME_IDS = [0, 2, 4, 6] as const;
const LANTERN_COLORS = [0xff4d4f, 0xff9f43, 0xffd84d, 0xef5da8, 0x3ed6c4] as const;

function frameUrls(index: number): string[] {
  const profile = PROFILES[((index % PROFILES.length) + PROFILES.length) % PROFILES.length] ?? PROFILES[0];
  return FRAME_IDS.map(
    (frame) => `${RAW_BASE}/${profile.folder}/Poses%20HD/character_${profile.prefix}_walk${frame}.png`,
  );
}

const ALL_CHARACTER_URLS = PROFILES.flatMap((_, index) => frameUrls(index));
const preloadPromise = Assets.load(ALL_CHARACTER_URLS);

export async function preloadCharacterAssets(): Promise<void> {
  await preloadPromise;
}

export type CharacterArt = Container & {
  bobSeed: number;
  lanternArt: Container | null;
  runnerArt: AnimatedSprite | null;
};

function attachRunner(group: CharacterArt, index: number): void {
  if (group.destroyed || group.runnerArt) return;

  const textures = frameUrls(index)
    .map((url) => Assets.get<Texture>(url))
    .filter((texture): texture is Texture => Boolean(texture));

  if (textures.length !== FRAME_IDS.length) return;

  const runner = new AnimatedSprite(textures);
  runner.anchor.set(0.5, 1);
  runner.animationSpeed = 0.105 + (index % 3) * 0.008;
  runner.loop = true;
  runner.height = 178;
  runner.scale.x = runner.scale.y;
  runner.play();
  group.addChildAt(runner, 1);
  group.runnerArt = runner;
}

export function createCharacter(index = 0, withLantern = true): CharacterArt {
  const group = new Container() as CharacterArt;
  group.bobSeed = index * 0.73 + 0.3;
  group.lanternArt = null;
  group.runnerArt = null;

  const shadow = new Graphics();
  shadow.ellipse(0, 5, 36, 11).fill({ color: 0x050c19, alpha: 0.34 });
  group.addChild(shadow);

  attachRunner(group, index);
  if (!group.runnerArt) {
    void preloadPromise.then(() => attachRunner(group, index)).catch(() => {
      // Keep gameplay alive even if a third-party texture endpoint is temporarily unavailable.
    });
  }

  if (withLantern) {
    const pole = new Graphics();
    pole.moveTo(33, -72).lineTo(58, -142).stroke({ color: 0xb88745, width: 4, alpha: 0.96 });
    group.addChild(pole);

    const lantern = createStarLantern(
      LANTERN_COLORS[((index % LANTERN_COLORS.length) + LANTERN_COLORS.length) % LANTERN_COLORS.length] ?? 0xff4d4f,
      0.74,
    );
    lantern.position.set(60, -151);
    group.addChild(lantern);
    group.lanternArt = lantern;
  }

  return group;
}
