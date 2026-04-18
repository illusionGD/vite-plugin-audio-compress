import type { AudioTransformOptions, TransformOverride } from "./types";

/**
 * 合并单文件转换配置
 * Resolve per-file transform options.
 * @param filePath 文件路径 / File path.
 * @param baseOptions 默认配置 / Base options.
 * @param transform transform 函数 / Transform function.
 */
export function resolveTransformOptions(
  filePath: string,
  baseOptions: AudioTransformOptions,
  transform: ((filePath: string) => void | TransformOverride) | undefined,
): AudioTransformOptions {
  if (!transform) {
    return baseOptions;
  }

  const override = transform(filePath);
  if (!override) {
    return baseOptions;
  }

  return {
    format: override.format ?? baseOptions.format,
    bitrate: override.bitrate ?? baseOptions.bitrate,
    sampleRate: override.sampleRate ?? baseOptions.sampleRate,
    channels: override.channels ?? baseOptions.channels,
  };
}
