import "dotenv/config";
import { glob, Glob } from "glob";
import dirTree from "directory-tree";
import { imageSizeFromFile, setConcurrency } from "image-size/fromFile";
import uniqid from "uniqid";

import { getBlurImageData } from "./imageProcessing";
import { safeUrl } from "./helpers";

import config from "../config";

setConcurrency(500);

import type { DirectoryTreeCallback } from "directory-tree";
import type { GlobOptions, Path } from "glob";

const processPath = (path) => {
  const newPath = path.replace(`${process.env.IMAGES_FOLDER}/`, "");
  return newPath;
};

const directoryCallback: DirectoryTreeCallback = (item) => {
  item.custom = { id: uniqid() };
  item.path = processPath(item.path);
  if (item.name === process.env.IMAGES_FOLDER) item.name = "root_folder";
};

export const getAlbums = async () => {
  const albumsTree = await dirTree(
    `${process.env.IMAGES_FOLDER}/`,
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
  const response: { status: number; error: boolean; message: string; images: string[] | Path[] | null } = {
    status: 200,
    error: false,
    message: "",
    images: null,
  };

  const images = [];
  const safeUrlResponse = safeUrl(`${process.env.IMAGES_FOLDER}`, location);

  if (safeUrlResponse.error) {
    response.status = 400;
    response.error = true;
    response.message = safeUrlResponse.message;
  }

  // console.log("SafeURL: ", safeUrlResponse.safeUrl);
  const globOptions: GlobOptions = { cwd: safeUrlResponse.safeUrl };

  if (!response.error) {
    const glob1 = new Glob(`*.{${config.httpConfig.acceptedExt.join(",")}}`, globOptions);

    try {
      for await (const image of glob1) {
        const details = await imageSizeFromFile(`${safeUrlResponse.safeUrl}/${image}`);
        const placeholder = await getBlurImageData(`${safeUrlResponse.safeUrl}/${image}`);
        images.push({ fileName: image, details, placeholder });
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
