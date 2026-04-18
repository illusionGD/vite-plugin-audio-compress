/**
 * Vite 6 兼容性示例配置（与上级 playground 共用源码与 index.html）
 * Vite 6 compatibility config (shares playground source and index.html).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import audioCompress from "../../../src/index";

const playgroundRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  root: playgroundRoot,
  plugins: [
    vue(),
    audioCompress({
      removeOriginal: false,
    }),
  ],
  build: {
    assetsInlineLimit: 0,
  },
});
