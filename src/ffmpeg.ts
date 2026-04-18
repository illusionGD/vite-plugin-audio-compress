import path from "node:path";
import { execa } from "execa";
import ffmpegPath from "ffmpeg-static";
import { promises as fsPromises } from "node:fs";
import type { AudioTransformOptions } from "./types";

/**
 * 选择音频编码器参数
 * Pick audio encoder args.
 * @param format 输出格式 / Output format.
 */
function buildEncoderArgs(format: string): string[] {
  switch (format) {
    case "mp3":
      return ["-c:a", "libmp3lame"];
    case "aac":
      return ["-c:a", "aac"];
    case "ogg":
      return ["-c:a", "libvorbis"];
    case "flac":
      return ["-c:a", "flac"];
    case "wav":
      return ["-c:a", "pcm_s16le"];
    default:
      return [];
  }
}

/**
 * 执行 ffmpeg 转换
 * Run ffmpeg conversion.
 * @param inputPath 输入文件路径 / Input file path.
 * @param outputPath 输出文件路径 / Output file path.
 * @param options 音频参数 / Audio options.
 */
export async function runFfmpeg(
  inputPath: string,
  outputPath: string,
  options: AudioTransformOptions,
): Promise<void> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static path is not available.");
  }

  await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });

  const encoderArgs = buildEncoderArgs(options.format);
  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    inputPath,
    "-vn",
    ...encoderArgs,
    "-b:a",
    options.bitrate,
    "-ar",
    String(options.sampleRate),
    "-ac",
    String(options.channels),
    "-f",
    options.format,
    outputPath,
  ];

  await execa(ffmpegPath, args);
}
