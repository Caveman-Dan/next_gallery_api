import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

import config from "../../config";
import { safeUrl } from "../helpers";
import type { CustomError } from "../definitions";

const { IMAGES_FOLDER } = process.env;
const ALLOWED_WIDTHS = new Set(config.transform.allowedWidths);

const parseWidth = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const width = Number.parseInt(String(raw), 10);
  if (!ALLOWED_WIDTHS.has(width)) return null;
  return width;
};

export const transformImage = async (req, res, next) => {
  if (req.query.w === undefined) return next();

  const width = parseWidth(req.query.w);
  if (width === null) {
    const err = new Error(
      `Image Transform - Bad request: w must be one of ${config.transform.allowedWidths.join(
        ", "
      )} (got ${JSON.stringify(req.query.w)}).`
    );
    (err as CustomError).statusCode = 400;
    return next(err);
  }

  const relative = decodeURIComponent(req.path).replace(/^\/+/, "");

  const safe = await safeUrl(`${IMAGES_FOLDER}`, relative);
  if (safe.error || !safe.safeUrl) {
    const err = new Error(safe.message || "Bad request");
    (err as CustomError).statusCode = 400;
    return next(err);
  }

  try {
    const srcStat = await fs.stat(safe.safeUrl);
    if (!srcStat.isFile()) {
      const err = new Error(`Image Transform - Not found: no image at "${relative}"`);
      (err as CustomError).statusCode = 404;
      return next(err);
    }

    const ext = path.extname(safe.safeUrl);
    const base = path.basename(safe.safeUrl, ext);
    const root = await fs.realpath(path.resolve(IMAGES_FOLDER as string));
    const relDir = path.relative(root, path.dirname(safe.safeUrl));
    const out = path.join(
      config.cache.folder,
      `v${config.cache.cacheVersion}`,
      "transforms",
      relDir,
      `${base}_w${width}_${Math.round(srcStat.mtimeMs)}.jpg`
    );

    try {
      await fs.access(out);
    } catch {
      await fs.mkdir(path.dirname(out), { recursive: true });
      await sharp(safe.safeUrl)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality: config.transform.jpegQuality })
        .toFile(out);
    }

    return res.sendFile(path.resolve(out), { maxAge: config.httpConfig.maxAge });
  } catch (err) {
    if ((err as { code?: string }).code === "ENOENT") {
      const notFound = new Error("Image Transform - Resource not found");
      (notFound as CustomError).statusCode = 404;
      return next(notFound);
    }
    const wrapped = new Error(err instanceof Error ? err.message : String(err));
    (wrapped as CustomError).statusCode = 500;
    return next(wrapped);
  }
};
