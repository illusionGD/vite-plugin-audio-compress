import { defineConfig } from "rolldown";

/**
 * 构建配置
 * Build config.
 */
export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
  ],
  external: [
    "ffmpeg-static",
    "execa",
    "vite",
    "node:fs",
    "node:path",
    "node:url",
    "node:crypto",
    "node:stream",
    "fs",
    "path",
    "url",
    "crypto",
    "stream",
  ],
});
