import type { FilterPattern } from "@rollup/pluginutils";
import type { AudioCompressOptions, TransformOverride } from "./plugin-options";

/**
 * 音频转换配置
 * Audio transform options.
 */
export interface AudioTransformOptions {
  /**
   * 音频格式
   * Audio format.
   */
  format: string;
  /**
   * 音频比特率
   * Audio bitrate.
   */
  bitrate: string;
  /**
   * 音频采样率
   * Audio sample rate.
   */
  sampleRate: number;
  /**
   * 音频通道数
   * Audio channels.
   */
  channels: number;
}

/**
 * 归一化后的配置
 * Normalized plugin options.
 */
export interface NormalizedAudioCompressOptions {
  /**
   * include 过滤规则
   * Include filter patterns.
   */
  include?: FilterPattern;
  /**
   * exclude 过滤规则
   * Exclude filter patterns.
   */
  exclude?: FilterPattern;
  /**
   * 自定义过滤器
   * Custom filter.
   */
  filter: (filePath: string) => boolean;
  /**
   * 输出格式
   * Output format.
   */
  format: string;
  /**
   * 输出比特率
   * Output bitrate.
   */
  bitrate: string;
  /**
   * 输出采样率
   * Output sample rate.
   */
  sampleRate: number;
  /**
   * 输出通道数
   * Output channels.
   */
  channels: number;
  /**
   * 缓存目录
   * Cache directory.
   */
  cacheDir: string;
  /**
   * 并发数
   * Concurrency.
   */
  concurrency: number;
  /**
   * 保留以兼容旧配置；当前打包不影响产物
   * Kept for compatibility; ignored for build output today.
   */
  removeOriginal: boolean;
  /**
   * 单文件转换配置
   * Per-file transform override.
   */
  transform?: (filePath: string) => void | TransformOverride;
}

/**
 * 对外导出类型
 * Re-export public types.
 */
export type { AudioCompressOptions, TransformOverride };
