import fs from "node:fs";
import path from "node:path";
import { promises as fsPromises } from "node:fs";
import type { Plugin, ResolvedConfig } from "vite";
import { PLUGIN_NAME } from "./constants";
import type { AudioCompressOptions, NormalizedAudioCompressOptions } from "./types";
import { createAudioFilter, isAudioFile } from "./filter";
import { createConcurrencyPool, type ConcurrencyPool } from "./concurrency";
import { replaceReferences } from "./replacer";
import {
  createSourceHash,
  ensureCacheDir,
  writeTempInputFile,
} from "./cache";
import {
  ensureUniqueFileName,
  getContentType,
  normalizeOptions,
  processAudioFile,
  replaceExtension,
  resolveRequestFile,
  shouldPassThroughAudioRequestToVite,
} from "./utils";
import {
  printAudioBuildSummary,
  type AudioBuildLogEntry,
  toDisplayPath,
} from "./build-audio-log";

/**
 * 音频压缩与格式转换插件（开发与打包共用）
 * Audio compress plugin for dev and build.
 * @param options 用户配置 / User options.
 */
export function audioCompress(options?: AudioCompressOptions): Plugin {
  let resolvedConfig: ResolvedConfig | undefined;
  let normalizedOptions: NormalizedAudioCompressOptions | undefined;
  let audioFilter: ((filePath: string) => boolean) | undefined;
  let pool: ConcurrencyPool | undefined;
  const replacementMap = new Map<string, string>();
  const buildAudioLog: AudioBuildLogEntry[] = [];

  return {
    name: PLUGIN_NAME,
    configResolved(config) {
      resolvedConfig = config;
      normalizedOptions = normalizeOptions(options, config.root);
      audioFilter = createAudioFilter(
        normalizedOptions.include,
        normalizedOptions.exclude,
        normalizedOptions.filter,
      );
      pool = createConcurrencyPool(normalizedOptions.concurrency);
    },
    buildStart() {
      if (resolvedConfig?.command === "build") {
        buildAudioLog.length = 0;
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !resolvedConfig || !normalizedOptions || !audioFilter || !pool) {
          next();
          return;
        }

        try {
          const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
          if (shouldPassThroughAudioRequestToVite(url)) {
            next();
            return;
          }

          const filePath = resolveRequestFile(url, resolvedConfig.root, resolvedConfig.publicDir);

          if (!filePath || !audioFilter(filePath)) {
            next();
            return;
          }

          await ensureCacheDir(normalizedOptions.cacheDir);
          const { cachePath, transformOptions } = await processAudioFile(
            filePath,
            normalizedOptions,
            undefined,
            pool,
          );

          res.statusCode = 200;
          res.setHeader("Content-Type", getContentType(`.${transformOptions.format}`));
          fs.createReadStream(cachePath).pipe(res);
        } catch (error) {
          next(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
    async generateBundle(_outputOptions, bundle) {
      if (!resolvedConfig || !normalizedOptions || !audioFilter || !pool) {
        return;
      }

      await ensureCacheDir(normalizedOptions.cacheDir);
      replacementMap.clear();

      const initialAssetFileNames = Object.keys(bundle).filter((key) => {
        const file = bundle[key];
        return (
          file.type === "asset" &&
          typeof file.fileName === "string" &&
          isAudioFile(file.fileName)
        );
      });

      for (const assetFileName of initialAssetFileNames) {
        const asset = bundle[assetFileName];
        if (!asset || asset.type !== "asset" || typeof asset.fileName !== "string") {
          continue;
        }
        if (!asset.fileName || !asset.fileName.includes(".")) {
          continue;
        }

        const originalFileName =
          typeof asset.originalFileName === "string"
            ? asset.originalFileName
            : typeof asset.name === "string"
              ? asset.name
              : asset.fileName;
        const resolvedPath = path.isAbsolute(originalFileName)
          ? originalFileName
          : path.resolve(resolvedConfig.root, originalFileName);

        const filterPath = fs.existsSync(resolvedPath) ? resolvedPath : asset.fileName;
        if (!audioFilter(filterPath)) {
          continue;
        }

        const extension = path.extname(asset.fileName);
        const source = asset.source ?? "";
        const sourceBuffer =
          typeof source === "string" ? Buffer.from(source) : Buffer.from(source as Uint8Array);
        const sourceHash = createSourceHash(sourceBuffer);
        const inputPath = fs.existsSync(resolvedPath)
          ? resolvedPath
          : await writeTempInputFile(normalizedOptions.cacheDir, extension, sourceBuffer);

        const { cachePath, transformOptions } = await processAudioFile(
          inputPath,
          normalizedOptions,
          sourceHash,
          pool,
        );
        const outputBuffer = await fsPromises.readFile(cachePath);

        if (resolvedConfig.command === "build") {
          const displayPath = fs.existsSync(resolvedPath)
            ? toDisplayPath(resolvedPath, resolvedConfig.root)
            : asset.fileName;
          buildAudioLog.push({
            displayPath,
            sourceExt: extension.toLowerCase(),
            originalBytes: sourceBuffer.byteLength,
            outputBytes: outputBuffer.byteLength,
            outputFormat: transformOptions.format,
            bitrate: transformOptions.bitrate,
            sampleRate: transformOptions.sampleRate,
          });
        }

        const nextFileName = replaceExtension(asset.fileName, transformOptions.format);
        const finalFileName =
          nextFileName === asset.fileName
            ? asset.fileName
            : ensureUniqueFileName(nextFileName, bundle);
        replacementMap.set(asset.fileName, finalFileName);

        // Rolldown 会忽略对 bundle 的新增赋值，只就地改写已有资源的 fileName/source
        // Rolldown ignores `bundle[newKey] = …`; mutate fileName/source on the existing asset only.
        const outputAsset = bundle[assetFileName];
        if (!outputAsset || outputAsset.type !== "asset") {
          continue;
        }
        const mutable = outputAsset as { fileName: string; source: string | Uint8Array };
        mutable.fileName = finalFileName;
        mutable.source = outputBuffer;
      }

      for (const file of Object.values(bundle)) {
        if (file.type === "chunk") {
          file.code = replaceReferences(file.code, replacementMap);
        }
        if (file.type === "asset" && typeof file.source === "string") {
          file.source = replaceReferences(file.source, replacementMap);
        }
      }
    },
    closeBundle() {
      if (resolvedConfig?.command !== "build" || buildAudioLog.length === 0) {
        return;
      }
      printAudioBuildSummary(PLUGIN_NAME, buildAudioLog);
      buildAudioLog.length = 0;
    },
  };
}

export default audioCompress;
export type { AudioCompressOptions, TransformOverride } from "./types";
