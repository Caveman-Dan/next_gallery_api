import fs from "fs/promises";
import path from "path";

import config from "../config";
import { logError } from "./errorHandling";

import type { ImagesObject } from "./definitions";

const IMAGE_EXT = new Set(config.httpConfig.acceptedExt.map((ext) => ext.toLowerCase()));

const isImage = (name: string) => IMAGE_EXT.has(path.extname(name).slice(1).toLowerCase());

const cacheFileFor = (root: string, albumDir: string) => {
  const relativeP = path.relative(root, albumDir);
  return path.join(config.cache.folder, relativeP, "manifest.json");
};

// Create a signature of the files in a folder using name, size, m-time
// Files are sorted so order is the same every time
// If you touch a file in the folder or make any other changes
// The signature will be different
export const folderSignature = async (dir: string) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && isImage(entry.name))
    .map((entry) => entry.name)
    .sort();

  const parts = await Promise.all(
    files.map(async (name) => {
      const { mtimeMs, size } = await fs.stat(path.join(dir, name));
      return `${name}:${size}:${mtimeMs}`;
    })
  );

  return parts.join("|");
};

export const readImageCache = async (root: string, albumDir: string, signature: string) => {
  try {
    const parsed = JSON.parse(await fs.readFile(cacheFileFor(root, albumDir), "utf8")) as {
      cacheVersion: number;
      signature: string;
      images: ImagesObject[];
    };
    if (
      parsed.cacheVersion === config.cache.cacheVersion &&
      parsed.signature === signature &&
      Array.isArray(parsed.images)
    )
      return parsed.images;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "ENOENT") {
      logError(`Failed to read image cache: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return null;
};

export const writeImageCache = async (root: string, albumDir: string, signature: string, images: ImagesObject[]) => {
  try {
    const file = cacheFileFor(root, albumDir);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify({ cacheVersion: config.cache.cacheVersion, signature, images }));
  } catch (err) {
    logError(`Failed to write image cache: ${err instanceof Error ? err.message : String(err)}`);
  }
};
