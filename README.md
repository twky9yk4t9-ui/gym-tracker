# Forge

A single-user gym tracker built as an installable iPhone web app. Dark iron, liquid glass,
zero friction: build your own program, log straight sets with one tap, and watch strength
arrive — e1RM trends, weekly muscle volume against the 10–20 set band, and an earned-jump
cue when you clear the top of your rep range.

Everything lives on-device (localStorage). No backend, no account, no telemetry.
Back up and restore your data as JSON from Settings.

## Install on iPhone

1. Open the app URL in Safari.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. Launch **Forge** from the home screen — it runs full-screen and fully offline.

## Develop

```sh
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build (dist/)
npm run icons      # regenerate app icons from the SVG mark
```

Vite + React + TypeScript + Tailwind v4 · zustand · recharts · motion · lucide-react ·
vite-plugin-pwa. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push
to `main`.
