
[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [中文](./README.zh-CN.md)

[Vite](https://vitejs.dev/) plugin for compressing and converting audio assets using `ffmpeg-static` and `execa`. It works in **dev** (middleware + cache) and **build** (bundle rewrite; each matched asset is replaced in place).

## Features

- Convert and compress audio formats (default: `mp3`)
- Dev server middleware with disk cache
- Build-time asset conversion with reference rewriting (`import`, `?url`, inline strings)
- Optional `removeOriginal` kept for compatibility (no effect on build output today)
- `include` / `exclude` / `filter` / `transform` hooks
- Concurrency control for ffmpeg jobs

## Install

```bash
# npm
npm i -D vite-plugin-audio-compress
# pnpm
pnpm i -D vite-plugin-audio-compress
#yarn
yarn add -D vite-plugin-audio-compress
```
## Usage

```ts
import { defineConfig } from "vite";
import audioCompress from "vite-plugin-audio-compress";

export default defineConfig({
  plugins: [audioCompress()],
});
```
## Options

Types are exported from `vite-plugin-audio-compress` and `vite-plugin-audio-compress/type`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `include` / `exclude` | `FilterPattern` | - | Rollup-style glob filters |
| `filter` | `(filePath: string) => boolean` | `() => true` | Extra filter after globs |
| `format` | `string` | `mp3` | Output container/codec hint |
| `bitrate` | `string` | `128k` | Audio bitrate |
| `sampleRate` | `number` | `44100` | Sample rate |
| `channels` | `number` | `2` | Channel count |
| `transform` | `(filePath: string) => void \| Partial<...>` | - | Per-file overrides |
| `cacheDir` | `string` | `node_modules/.cache/vite-plugin-audio-compress` | Cache directory |
| `concurrency` | `number` | `2` | Max parallel ffmpeg jobs |
| `removeOriginal` | `boolean` | `false` | Reserved for compatibility; build always replaces each matched audio asset in place (same public path when the extension is unchanged) |

## Dev mode

The plugin intercepts audio requests, converts them once, and serves cached output. Cache keys include file stats and encoding parameters.

## Build mode

During `generateBundle`, audio assets are converted in place (including same-format recompression), `fileName` / `source` are updated on the existing output asset, and references in JS/CSS/HTML-like text assets are rewritten so URLs stay consistent with the emitted file.

## Notes

- Works with Rollup-based Vite and Rolldown-based Vite by using shared Rollup hooks.
- Ensure `ffmpeg-static` resolves correctly in your environment (CI agents need compatible OS binaries).
