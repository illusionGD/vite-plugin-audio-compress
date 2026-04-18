import path from "node:path";
import pc from "picocolors";

/**
 * 单条音频构建统计
 * Single audio asset build stat.
 */
export interface AudioBuildLogEntry {
  /**
   * 展示用相对路径
   * Display path (relative to project root when possible).
   */
  displayPath: string;
  /**
   * 源文件扩展名
   * Source file extension.
   */
  sourceExt: string;
  /**
   * 转换前字节数
   * Byte size before conversion.
   */
  originalBytes: number;
  /**
   * 转换后字节数
   * Byte size after conversion.
   */
  outputBytes: number;
  /**
   * 输出编码格式
   * Output codec/container format.
   */
  outputFormat: string;
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
}

/**
 * 格式化字节为人类可读字符串
 * Format bytes as human-readable string.
 * @param bytes 字节数 / Byte count.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 计算相对项目根的路径用于展示
 * Resolve display path relative to project root.
 * @param absolutePath 绝对路径 / Absolute path.
 * @param root 项目根目录 / Project root.
 */
export function toDisplayPath(absolutePath: string, root: string): string {
  const rel = path.relative(root, absolutePath);
  if (!rel || rel.startsWith("..")) {
    return path.basename(absolutePath);
  }
  return rel.split(path.sep).join("/");
}

/**
 * 带颜色的压缩率文案
 * Colored compression ratio label.
 * @param originalBytes 原始字节 / Original bytes.
 * @param outputBytes 输出字节 / Output bytes.
 */
export function formatCompressionHighlight(originalBytes: number, outputBytes: number): string {
  if (originalBytes <= 0) {
    return pc.dim("n/a");
  }
  const ratio = outputBytes / originalBytes;
  const savedPct = (1 - ratio) * 100;
  if (savedPct > 0.05) {
    return pc.green(`−${savedPct.toFixed(1)}%`);
  }
  if (savedPct < -0.05) {
    return pc.yellow(`+${(-savedPct).toFixed(1)}%`);
  }
  return pc.dim("≈0%");
}

/**
 * 打印打包阶段音频转换汇总（彩色）
 * Print colored audio conversion summary after bundle.
 * @param pluginName 插件名 / Plugin name.
 * @param entries 统计条目 / Stat entries.
 */
export function printAudioBuildSummary(
  pluginName: string,
  entries: readonly AudioBuildLogEntry[],
): void {
  if (entries.length === 0) {
    return;
  }

  const lines: string[] = [];
  lines.push("");
  lines.push(pc.cyan(pc.bold(`[${pluginName}]`)) + " " + pc.white("Audio compression"));
  lines.push(pc.dim("─".repeat(76)));

  let totalIn = 0;
  let totalOut = 0;

  for (const row of entries) {
    totalIn += row.originalBytes;
    totalOut += row.outputBytes;
    const ratioText = formatCompressionHighlight(row.originalBytes, row.outputBytes);
    const sizeLine = `${pc.dim(formatBytes(row.originalBytes))} → ${pc.bold(formatBytes(row.outputBytes))}`;
    lines.push(
      `  ${pc.magenta(row.displayPath)} ${pc.dim(`(${row.sourceExt} → .${row.outputFormat})`)}`,
    );
    lines.push(
      `    ${pc.dim(`${row.bitrate} · ${row.sampleRate} Hz`)}  ${sizeLine}  ${pc.dim("ratio:")} ${ratioText}`,
    );
  }

  lines.push(pc.dim("─".repeat(76)));
  const totalRatio = formatCompressionHighlight(totalIn, totalOut);
  lines.push(
    `  ${pc.bold("Total")}  ${pc.dim(formatBytes(totalIn))} → ${pc.bold(formatBytes(totalOut))}  ` +
      `${pc.dim("overall ratio:")} ${totalRatio}`,
  );
  lines.push("");

  console.log(lines.join("\n"));
}
