/**
 * 单文件转换覆盖配置
 * Per-file transform override.
 */
export interface TransformOverride {
  /**
   * 音频格式
   * Audio format.
   */
  format?: string;
  /**
   * 音频比特率
   * Audio bitrate.
   */
  bitrate?: string;
  /**
   * 音频采样率
   * Audio sample rate.
   */
  sampleRate?: number;
  /**
   * 音频通道数
   * Audio channels.
   */
  channels?: number;
}

/**
 * 插件用户配置
 * Plugin user options.
 */
export interface AudioCompressOptions {
  /**
   * 排除的文件或者文件夹路径
   * Excluded files or directories.
   */
  exclude?: string | string[];
  /**
   * 包含的文件或者文件夹路径
   * Included files or directories.
   */
  include?: string | string[];
  /**
   * 过滤器
   * Custom filter.
   */
  filter?: (filePath: string) => boolean;
  /**
   * 音频比特率
   * Audio bitrate.
   */
  bitrate?: string;
  /**
   * 音频采样率
   * Audio sample rate.
   */
  sampleRate?: number;
  /**
   * 音频通道数
   * Audio channels.
   */
  channels?: number;
  /**
   * 音频格式
   * Audio format.
   */
  format?: string;
  /**
   * 转换器
   * Per-file transform override.
   */
  transform?: (filePath: string) => void | TransformOverride;
  /**
   * 缓存目录
   * Cache directory.
   */
  cacheDir?: string;
  /**
   * 并发数
   * Concurrency.
   */
  concurrency?: number;
  /**
   * 保留以兼容旧配置；当前打包阶段对匹配的音频一律就地替换，此项不影响产物
   * Kept for compatibility; build always replaces matched audio assets in place.
   */
  removeOriginal?: boolean;
}
