import path from "node:path";
import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";
import { AUDIO_EXTENSIONS } from "./constants";

/**
 * 判断是否音频扩展名
 * Check audio extension.
 * @param filePath 文件路径 / File path.
 */
export function isAudioFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return AUDIO_EXTENSIONS.includes(ext);
}

/**
 * 创建音频过滤器
 * Create audio filter.
 * @param include include 规则 / Include patterns.
 * @param exclude exclude 规则 / Exclude patterns.
 * @param customFilter 自定义过滤器 / Custom filter.
 */
export function createAudioFilter(
  include: FilterPattern | undefined,
  exclude: FilterPattern | undefined,
  customFilter: ((filePath: string) => boolean) | undefined,
): (filePath: string) => boolean {
  const rollupFilter = include || exclude ? createFilter(include, exclude) : undefined;

  return (filePath: string) => {
    if (!isAudioFile(filePath)) {
      return false;
    }
    if (rollupFilter && !rollupFilter(filePath)) {
      return false;
    }
    if (customFilter && !customFilter(filePath)) {
      return false;
    }
    return true;
  };
}
