import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_BITRATE,
  DEFAULT_CACHE_DIR,
  DEFAULT_CHANNELS,
  DEFAULT_CONCURRENCY,
  DEFAULT_FORMAT,
  DEFAULT_SAMPLE_RATE,
} from "./constants";
import type {
  AudioCompressOptions,
  AudioTransformOptions,
  NormalizedAudioCompressOptions,
} from "./types";
import { resolveTransformOptions } from "./transform";
import { getCacheFilePath } from "./cache";
import { runFfmpeg } from "./ffmpeg";
import type { ConcurrencyPool } from "./concurrency";

/**
 * 归一化配置
 * Normalize plugin options.
 * @param options 用户配置 / User options.
 * @param root 项目根目录 / Project root.
 */
export function normalizeOptions(
  options: AudioCompressOptions | undefined,
  root: string,
): NormalizedAudioCompressOptions {
  const cacheDirRaw = options?.cacheDir ?? DEFAULT_CACHE_DIR;
  const cacheDir = path.isAbsolute(cacheDirRaw)
    ? cacheDirRaw
    : path.resolve(root, cacheDirRaw);

  return {
    include: options?.include,
    exclude: options?.exclude,
    filter: options?.filter ?? (() => true),
    format: options?.format ?? DEFAULT_FORMAT,
    bitrate: options?.bitrate ?? DEFAULT_BITRATE,
    sampleRate: options?.sampleRate ?? DEFAULT_SAMPLE_RATE,
    channels: options?.channels ?? DEFAULT_CHANNELS,
    cacheDir,
    concurrency: options?.concurrency ?? DEFAULT_CONCURRENCY,
    removeOriginal: options?.removeOriginal ?? false,
    transform: options?.transform,
  };
}

/**
 * 解析请求文件路径
 * Resolve request file path.
 * @param url 请求 URL / Request URL.
 * @param root 项目根目录 / Project root.
 * @param publicDir public 目录 / Public directory.
 */
export function resolveRequestFile(
  url: URL,
  root: string,
  publicDir: string,
): string | undefined {
  const pathname = decodeURIComponent(url.pathname);
  const fsPrefix = "/@fs/";

  if (pathname.startsWith(fsPrefix)) {
    const rawPath = pathname.slice(fsPrefix.length);
    return path.normalize(rawPath);
  }

  const rootPath = path.resolve(root, `.${pathname}`);
  if (fs.existsSync(rootPath)) {
    return rootPath;
  }

  if (publicDir.length > 0) {
    const publicPath = path.resolve(publicDir, `.${pathname}`);
    if (fs.existsSync(publicPath)) {
      return publicPath;
    }
  }

  return undefined;
}

/**
 * 是否应把请求交给 Vite（不拦截为压缩音频流）
 * Whether to pass the request to Vite (do not serve compressed audio).
 * @param url 请求 URL / Request URL.
 */
export function shouldPassThroughAudioRequestToVite(url: URL): boolean {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.startsWith("/@")) {
    return true;
  }
  /**
   * Vite 资源后缀：?url / ?import / ?raw 等必须返回 JS 或管线数据，
   * 不能返回 audio/*，否则浏览器会报「模块脚本 MIME 类型」错误。
   * Vite resource queries must return JS/pipeline data, not audio/*.
   */
  if (url.searchParams.has("import")) {
    return true;
  }
  if (url.searchParams.has("url")) {
    return true;
  }
  if (url.searchParams.has("raw")) {
    return true;
  }
  if (url.searchParams.has("worker")) {
    return true;
  }
  if (url.searchParams.has("shared")) {
    return true;
  }
  return false;
}

/**
 * 获取音频响应 Content-Type
 * Resolve audio response content-type.
 * @param extension 文件扩展名 / File extension.
 */
export function getContentType(extension: string): string {
  switch (extension) {
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    case ".aac":
      return "audio/aac";
    case ".flac":
      return "audio/flac";
    case ".m4a":
      return "audio/mp4";
    default:
      return "application/octet-stream";
  }
}

/**
 * 替换文件扩展名
 * Replace file extension.
 * @param fileName 文件名 / File name.
 * @param format 输出格式 / Output format.
 */
export function replaceExtension(fileName: string, format: string): string {
  return fileName.replace(/\.[^/.]+$/, `.${format}`);
}

/**
 * 保证文件名唯一
 * Ensure unique file name in bundle.
 * @param fileName 初始文件名 / Initial file name.
 * @param bundle Rollup bundle / Rollup bundle.
 */
export function ensureUniqueFileName(
  fileName: string,
  bundle: Record<string, unknown>,
): string {
  if (!bundle[fileName]) {
    return fileName;
  }
  const ext = path.extname(fileName);
  const base = fileName.slice(0, -ext.length);
  let index = 1;
  let nextName = `${base}.compressed${ext}`;
  while (bundle[nextName]) {
    index += 1;
    nextName = `${base}.compressed-${index}${ext}`;
  }
  return nextName;
}

/**
 * 处理音频文件转换
 * Process audio file conversion.
 * @param inputPath 输入文件路径 / Input file path.
 * @param options 归一化配置 / Normalized options.
 * @param sourceHash 源内容哈希 / Source hash.
 * @param pool 并发池 / Concurrency pool.
 */
export async function processAudioFile(
  inputPath: string,
  options: NormalizedAudioCompressOptions,
  sourceHash: string | undefined,
  pool: ConcurrencyPool,
): Promise<{ cachePath: string; transformOptions: AudioTransformOptions }> {
  const transformOptions = resolveTransformOptions(
    inputPath,
    {
      format: options.format,
      bitrate: options.bitrate,
      sampleRate: options.sampleRate,
      channels: options.channels,
    },
    options.transform,
  );

  const cachePath = await getCacheFilePath(
    {
      inputPath,
      format: transformOptions.format,
      transform: transformOptions,
      sourceHash,
    },
    options.cacheDir,
  );

  if (fs.existsSync(cachePath)) {
    return { cachePath, transformOptions };
  }

  await pool.run(async () => {
    if (fs.existsSync(cachePath)) {
      return;
    }
    await runFfmpeg(inputPath, cachePath, transformOptions);
  });

  return { cachePath, transformOptions };
}
