# 🏮 Rước Đèn Đêm Trăng

A lightweight **3D Vietnamese Mid-Autumn Festival web game** built with Three.js, TypeScript and Vite.

The player guides a lantern parade through a stylized night street, recruits more children, collects mooncakes and starlight, avoids obstacles, and tries to unlock **Full Moon Mode** before the 75-second run ends.

## Highlights

- Real-time 3D scene rendered with Three.js/WebGL
- Procedural low-poly art — no external models or textures required
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
| 📦 Obstacle | Ends the run |

Collect **18 lantern friends** in one run to activate Full Moon Mode and increase passive score gain.

## Stack

- [Three.js](https://threejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)

## Deployment

The project builds to `dist/` and uses a relative Vite base, so it can be hosted under a GitHub Pages repository path or another static host.

The included GitHub Actions workflow validates every pull request and can deploy `main` to GitHub Pages. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## Roadmap

- Online leaderboard and community moon counter
- Server-validated score submissions / anti-cheat
- Vietnamese / English language toggle
- Lion-dance bonus encounter
- More street themes and collectible lantern styles
- Optional GLTF character/art pack while retaining the low-poly fallback

## License

MIT
