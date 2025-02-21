import "dotenv/config";
import { glob } from "glob";
import dirTree from "directory-tree";
import uniqid from "uniqid";

import { safeUrl } from "./helpers";

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
  // return processDirTree(albumsTree.children);
  return albumsTree;
};

export const getImages = async (location) => {
  const response: { status: number; error: boolean; message: string; images: string[] | Path[] | null } = {
    status: 200,
    error: false,
    message: "",
    images: null,
  };

  const safeUrlResponse = safeUrl(`${process.env.IMAGES_FOLDER}`, location);

  if (safeUrlResponse.error) {
    response.status = 400;
    response.error = true;
    response.message = safeUrlResponse.message;
  }

  console.log("SafeURL: ", safeUrlResponse.safeUrl);

  const globOptions: GlobOptions = { cwd: safeUrlResponse.safeUrl };
  if (!response.error)
    response.images = await glob(`*.*`, globOptions).catch((err) => {
      console.error("ERROR: ", err);
      response.status = 500;
      response.error = true;
      response.message = err;
      return null;
    });

  if (response.images !== null && response.images.length === 0) {
    response.status = 404;
    response.error = true;
    response.message = "Resource not found";
  }

  return response;
};
