import "dotenv/config";

import path from "path";
import fs from "fs/promises";
import { folderSignature, readImageCache, writeImageCache } from "./imageCache";
import { Glob } from "glob";
import dirTree from "directory-tree";
import md5 from "md5";

import { logError } from "./errorHandling";
import { getBlurImageData, getImageDetails } from "./imageProcessing";
import { safeUrl } from "./helpers";

import config from "../config";

import type { DirectoryTreeCallback } from "directory-tree";
import type { ImagesObject } from "./definitions";

const { IMAGES_FOLDER, MAX_IMAGES_PER_ALBUM } = process.env;
const maxImagesPerAlbum = Number(MAX_IMAGES_PER_ALBUM) || 500;

const processPath = (path) => {
  const newPath = path.replace(`${IMAGES_FOLDER}/`, "");
  return newPath;
};

const warnIfCapped = (total: number, albumLabel: string, origin: string = "Reading file") => {
  if (total > maxImagesPerAlbum) {
    logError(
      `${origin} - Album "${albumLabel}" with ${total} images, exceeds max images! capping at ${maxImagesPerAlbum}.`
    );
  }
};

const directoryCallback: DirectoryTreeCallback = (item) => {
  item.path = processPath(item.path);
  if (item.name === IMAGES_FOLDER) item.name = "root_folder";
};

export const getAlbums = async () => {
  const albumsTree = await dirTree(
    `${IMAGES_FOLDER}/`,
    {
      attributes: ["type"],
      exclude: [/\.DS_Store/],
      extensions: /a^/, // match nothing to return only directories (anything with no extension)
    },
    () => null,
    directoryCallback
  );
  return albumsTree;
};

export const getImages = async (location) => {
  const response: { status: number; error: boolean; message: string; images: ImagesObject[] | null } = {
    status: 200,
    error: false,
    message: "",
    images: null,
  };

  const safeUrlResponse = await safeUrl(`${IMAGES_FOLDER}`, location);

  if (safeUrlResponse.error) {
    response.status = 400;
    response.error = true;
    response.message = safeUrlResponse.message;
  }

  if (!response.error) {
    try {
      const albumDir = safeUrlResponse.safeUrl;
      const root = await fs.realpath(path.resolve(IMAGES_FOLDER as string));
      const signature = await folderSignature(albumDir);
      const cached = await readImageCache(root, albumDir, signature);

      if (cached) {
        warnIfCapped(cached.length, location, "Reading cache");
        response.images = cached.slice(0, maxImagesPerAlbum);
      } else {
        const names: string[] = [];
        const glob1 = new Glob(
          `*.{${config.httpConfig.acceptedExt.join(",")},${config.httpConfig.acceptedExt
            .map((item) => item.toUpperCase())
            .join(",")}}`,
          { cwd: albumDir }
        );

        for await (const image of glob1) {
          names.push(image as string);
        }
        names.sort();

        const images: ImagesObject[] = [];
        for (const image of names.slice(0, maxImagesPerAlbum)) {
          const filePath = `${albumDir}/${image}`;
          const details = await getImageDetails(filePath);
          const placeholder = await getBlurImageData(filePath);
          const hash = md5(image);
          images.push({ fileName: image, md5: hash, details, placeholder });
        }

        await writeImageCache(root, albumDir, signature, images);
        response.images = images;
        warnIfCapped(names.length, location);
      }
    } catch (err) {
      response.error = true;
      response.status = 500;
      response.message = err instanceof Error ? err.message : String(err);
    }
  }

  if (response.images !== null && response.images.length === 0) {
    response.status = 404;
    response.error = true;
    response.message = "Resource not found";
  }

  return response;
};
