/**
 * 插件名称
 * Plugin name.
 */
export const PLUGIN_NAME = "vite-plugin-audio-compress";

/**
 * 默认缓存目录
 * Default cache directory.
 */
export const DEFAULT_CACHE_DIR = "node_modules/.cache/vite-plugin-audio-compress";

/**
 * 默认并发数
 * Default concurrency.
 */
export const DEFAULT_CONCURRENCY = 2;

/**
 * 默认比特率
 * Default bitrate.
 */
export const DEFAULT_BITRATE = "128k";

/**
 * 默认采样率
 * Default sample rate.
 */
export const DEFAULT_SAMPLE_RATE = 44100;

/**
 * 默认声道
 * Default channels.
 */
export const DEFAULT_CHANNELS = 2;

/**
 * 默认输出格式
 * Default output format.
 */
export const DEFAULT_FORMAT = "mp3";

/**
 * 支持的音频扩展名
 * Supported audio extensions.
 */
export const AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".aac",
  ".flac",
  ".m4a",
];
