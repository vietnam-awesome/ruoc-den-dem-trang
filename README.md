# 🏮 Rước Đèn Đêm Trăng

A lightweight Vietnamese Mid-Autumn Festival web game built with PixiJS, TypeScript and Vite.

The player guides a lantern parade through a stylized night street, recruits more children, collects mooncakes and starlight, avoids obstacles, and tries to unlock **Full Moon Mode** before the 75-second run ends.

## Highlights

- PixiJS 8 2.5D renderer with pseudo-perspective depth
- Animated HD character sprites instead of procedural placeholder characters
- Vietnamese star lantern overlay and festival effects
- Mobile-first swipe controls plus keyboard controls (`←` `→`, `A` `D`)
- 3-lane endless-runner gameplay
- Lantern recruits, mooncakes, combo scoring and Full Moon Mode
- Local best score via `localStorage`
- Native Web Share API with clipboard fallback
- Responsive HUD and reduced-motion consideration

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Gameplay

| Item | Effect |
| --- | --- |
| 🏮 Lantern friend | +90 base score, grows the parade, advances Full Moon meter |
| 🥮 Mooncake | +60 base score |
| ✨ Starlight | +42 base score |
| 📦 Obstacle | Ends the run |

Collect **18 lantern friends** in one run to activate Full Moon Mode and increase passive score gain.

## Stack

- [PixiJS](https://pixijs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)

## Character assets

The animated character artwork comes from Kenney's **Toon Characters** pack via the `shorepine/kenney` mirror. The source repository documents the art as **CC0**. See `THIRD_PARTY_ASSETS.md`.

## Deployment

The project builds to `dist/` and uses a relative Vite base, so it can be hosted under a GitHub Pages repository path or another static host.

The included GitHub Actions workflow validates every pull request and can deploy `main` to GitHub Pages.

## Roadmap

- Vendor the external CC0 character textures into the repository
- Mid-Autumn-specific costume variants
- Lion-dance bonus encounter
- Online leaderboard and community moon counter
- Vietnamese / English language toggle

## License

MIT
