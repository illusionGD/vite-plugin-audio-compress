/**
 * 示例项目 Vite 配置（Vue + 音频插件）
 * Playground Vite config (Vue + audio plugin).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import audioCompress from "../../src/index";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
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
