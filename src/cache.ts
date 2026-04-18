import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promises as fsPromises } from "node:fs";
import type { AudioTransformOptions } from "./types";

/**
 * 缓存键参数
 * Cache key parameters.
 */
export interface CacheKeyParams {
  /**
   * 输入文件路径
   * Input file path.
   */
  inputPath: string;
  /**
   * 输出格式
   * Output format.
   */
  format: string;
  /**
   * 变换参数
   * Transform options.
   */
  transform: AudioTransformOptions;
  /**
   * 源内容哈希
   * Source hash for in-memory assets.
   */
  sourceHash?: string;
}

/**
 * 确保缓存目录存在
 * Ensure cache directory exists.
 * @param cacheDir 缓存目录 / Cache directory.
 */
export async function ensureCacheDir(cacheDir: string): Promise<void> {
  await fsPromises.mkdir(cacheDir, { recursive: true });
}

/**
 * 生成缓存键
 * Create cache key.
 * @param params 缓存参数 / Cache parameters.
 */
export async function createCacheKey(params: CacheKeyParams): Promise<string> {
  const { inputPath, format, transform, sourceHash } = params;
  let size = 0;
  let mtimeMs = 0;

  if (fs.existsSync(inputPath)) {
    const stats = await fsPromises.stat(inputPath);
    size = stats.size;
    mtimeMs = stats.mtimeMs;
  }

  const payload = JSON.stringify({
    inputPath,
    format,
    bitrate: transform.bitrate,
    sampleRate: transform.sampleRate,
    channels: transform.channels,
    size,
    mtimeMs,
    sourceHash,
  });

  return crypto.createHash("sha1").update(payload).digest("hex");
}

/**
 * 获取缓存文件路径
 * Get cache file path.
 * @param params 缓存参数 / Cache parameters.
 * @param cacheDir 缓存目录 / Cache directory.
 */
export async function getCacheFilePath(
  params: CacheKeyParams,
  cacheDir: string,
): Promise<string> {
  const key = await createCacheKey(params);
  return path.join(cacheDir, `${key}.${params.format}`);
}

/**
 * 生成源内容哈希
 * Create source hash.
 * @param source 源内容 / Source content.
 */
export function createSourceHash(source: Buffer | string): string {
  return crypto.createHash("sha1").update(source).digest("hex");
}

/**
 * 写入临时输入文件
 * Write temp input file for in-memory assets.
 * @param cacheDir 缓存目录 / Cache directory.
 * @param extension 文件扩展名 / File extension.
 * @param source 文件内容 / File content.
 */
export async function writeTempInputFile(
  cacheDir: string,
  extension: string,
  source: Buffer | string,
): Promise<string> {
  const tempDir = path.join(cacheDir, "tmp");
  await fsPromises.mkdir(tempDir, { recursive: true });
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`;
  const filePath = path.join(tempDir, fileName);
  await fsPromises.writeFile(filePath, source);
  return filePath;
}
