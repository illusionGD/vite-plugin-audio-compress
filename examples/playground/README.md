# Playground

Vue 3 + Vite demo for `vite-plugin-audio-compress`. The page shows audio URL, inferred extension, duration, `readyState`, and `HEAD` metadata.

Dependencies and scripts live in **this directory’s** `package.json` (pnpm workspace package `@vite-plugin-audio-compress/playground`). Vite 6 is exercised by the nested package [`vite6/`](./vite6/) which points `root` at this folder so sources stay in one place.

## Prepare

Generate `src/assets/beep.wav` once:

```bash
# from repo root
pnpm run playground:prepare
# or from this directory
pnpm run prepare:wav
```

## Dev (Vite 8)

From **this directory**:

```bash
pnpm run dev
```

From the **repository root**:

```bash
pnpm dev
```

Open the URL printed by Vite. Use the audio controls to load metadata (duration).

## Dev / build (Vite 6)

From **this directory**:

```bash
pnpm run dev:vite6
pnpm run build:vite6
```

From the **repository root**:

```bash
pnpm run playground:dev:vite6
pnpm run playground:build:vite6
```

## Docs

- English: [README.md](../../README.md)
- 中文: [README.zh-CN.md](../../README.zh-CN.md)
