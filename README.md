# 🏮 Rước Đèn Đêm Trăng

A lightweight **2.5D Vietnamese Mid-Autumn Festival web game** built with PixiJS, TypeScript and Vite.

The player guides a lantern parade through a stylized Vietnamese festival street, recruits more children, collects mooncakes and starlight, avoids obstacles, and tries to unlock **Full Moon Mode** before the 75-second run ends.

## Highlights

- PixiJS 8 renderer with GPU-accelerated WebGL/WebGPU support
- Illustrated 2.5D perspective instead of primitive low-poly 3D
- Layered festival street, giant moon, hanging star lanterns, clouds and fireflies
- Vector-drawn Vietnamese star lanterns and stylized parade characters
- Perspective scaling and parallax to create depth while staying lightweight on mobile
- Particle bursts and Full Moon lighting state
- Mobile-first swipe controls plus keyboard controls (`←` `→`, `A` `D`)
- 3-lane endless-runner gameplay
- Lantern recruits, mooncakes, combo scoring and Full Moon Mode
- Local best score via `localStorage`
- Native Web Share API with clipboard fallback
- Responsive HUD and reduced-motion consideration
- Single CI workflow to avoid duplicate GitHub Actions work

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
| 🛒 Obstacle | Ends the run |

Collect **18 lantern friends** in one run to activate Full Moon Mode and increase passive score gain.

## Stack

- [PixiJS](https://pixijs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)

## Why PixiJS

The project originally used procedural Three.js geometry. The renderer was migrated to PixiJS so the game can focus on polished illustrated art, parallax, particles and mobile performance while retaining a strong sense of depth through 2.5D perspective projection.

## Deployment

The project builds to `dist/` and uses a relative Vite base, so it can be hosted under a GitHub Pages repository path or another static host.

The included GitHub Actions workflow validates every pull request and can deploy `main` to GitHub Pages. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## Roadmap

- Authored sprite sheets and richer character animation
- Lion-dance bonus encounter
- Online leaderboard and community moon counter
- Server-validated score submissions / anti-cheat
- Vietnamese / English language toggle
- More Vietnamese festival street themes and collectible lantern styles
- Optimized texture atlases for production art packs

## License

MIT
