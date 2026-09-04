import "dotenv/config";
import { Glob } from "glob";
import dirTree from "directory-tree";
import md5 from "md5";

import { getBlurImageData, getImageDetails } from "./imageProcessing";
import { safeUrl } from "./helpers";

import config from "../config";

import type { DirectoryTreeCallback } from "directory-tree";
import type { GlobOptions, Path } from "glob";
import type { ImagesObject } from "./definitions";

const { IMAGES_FOLDER } = process.env;

const processPath = (path) => {
  const newPath = path.replace(`${IMAGES_FOLDER}/`, "");
  return newPath;
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

  const images: ImagesObject[] = [];
  const safeUrlResponse = safeUrl(`${IMAGES_FOLDER}`, location);

  if (safeUrlResponse.error) {
    response.status = 400;
    response.error = true;
    response.message = safeUrlResponse.message;
  }

  // console.log("SafeURL: ", safeUrlResponse.safeUrl);
  const globOptions: GlobOptions = { cwd: safeUrlResponse.safeUrl };

  if (!response.error) {
    const glob1 = new Glob(
      `*.{${config.httpConfig.acceptedExt.join(",")},${config.httpConfig.acceptedExt
        .map((item) => item.toUpperCase())
        .join(",")}}`,
      globOptions
    );

    try {
      for await (const image of glob1) {
        const filePath = `${safeUrlResponse.safeUrl}/${image}`;
        const details = await getImageDetails(filePath);
        const placeholder = await getBlurImageData(filePath);
        const hash = md5(image as string);
        images.push({ fileName: image as string, md5: hash, details, placeholder });
      }
      response.images = images;
    } catch (err) {
      response.error = true;
      response.status = 500;
      response.message = err;
    }
  }

  if (response.images !== null && response.images.length === 0) {
    response.status = 404;
    response.error = true;
    response.message = "Resource not found";
  }

  return response;
};
