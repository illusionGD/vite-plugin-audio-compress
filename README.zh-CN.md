[English documentation / 英文文档](./README.md)

# vite-plugin-audio-compress

基于 `ffmpeg-static` 与 `execa` 的 Vite 音频压缩与格式转换插件，支持**开发模式**（中间件 + 缓存）与**打包模式**（就地替换 bundle 内音频资源并重写引用）。

## 功能特性

- 音频压缩与格式转换（默认输出 `mp3`）
- 开发模式中间件拦截与磁盘缓存
- 打包阶段转换资源并重写引用（`import`、`?url`、内联字符串等）
- `removeOriginal` 保留以兼容旧配置（当前不影响打包产物）
- `include` / `exclude` / `filter` / `transform` 细粒度控制
- 并发队列控制 ffmpeg 任务数量

## 安装

```bash
pnpm add vite-plugin-audio-compress ffmpeg-static execa
```

## 使用方式

```ts
import { defineConfig } from "vite";
import audioCompress from "vite-plugin-audio-compress";

export default defineConfig({
  plugins: [audioCompress()],
});
```

## 开源协议

[MIT](./LICENSE)

## 配置说明

类型可从 `vite-plugin-audio-compress` 与 `vite-plugin-audio-compress/type` 导入。

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `include` / `exclude` | `FilterPattern` | - | Rollup 风格的 glob 过滤 |
| `filter` | `(filePath: string) => boolean` | `() => true` | 额外自定义过滤 |
| `format` | `string` | `mp3` | 输出格式 |
| `bitrate` | `string` | `128k` | 音频码率 |
| `sampleRate` | `number` | `44100` | 采样率 |
| `channels` | `number` | `2` | 声道数 |
| `transform` | `(filePath: string) => void \| Partial<...>` | - | 针对单文件的参数覆盖 |
| `cacheDir` | `string` | `node_modules/.cache/vite-plugin-audio-compress` | 缓存目录 |
| `concurrency` | `number` | `2` | ffmpeg 最大并发数 |
| `removeOriginal` | `boolean` | `false` | 保留字段以兼容旧版；打包时对匹配的音频资源一律就地替换（扩展名不变则对外路径不变） |

## 开发模式

插件会拦截音频请求，首次转换后写入缓存，后续直接读取缓存文件。缓存键包含文件元数据与编码参数。

## 打包模式

在 `generateBundle` 阶段就地更新音频资源的 `fileName` 与内容（含同格式重压缩），并重写 JS/CSS/HTML 文本类产物中的引用，使 URL 与实际写出文件一致。

## 其他说明

- 仅使用 Rollup 通用钩子，兼容 Rolldown 版 Vite。
- 请确认运行环境能正确解析 `ffmpeg-static` 的二进制路径（CI 环境需注意系统架构）。
