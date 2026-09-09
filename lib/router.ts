import "dotenv/config";
import express from "express";

import { getAlbums, getImages } from "./fileAccess";

import type { CustomError } from "./definitions";

const statusEndpoint = process.env.GET_STATUS_ENDPOINT;
const albumsEndpoint = process.env.GET_ALBUMS_ENDPOINT;
const imagesEndpoint = process.env.GET_IMAGES_ENDPOINT;

const router = express.Router();

// status
router.get(`/${statusEndpoint}`, (req, res, next) => {
  res.send("status_ok");
});

// get_albums
router.get(`/${albumsEndpoint}`, async (req, res, next) => {
  const albumsResponse = await getAlbums();

  if (albumsResponse.error) {
    const err = new Error(albumsResponse.message);
    (err as CustomError).statusCode = albumsResponse.status;
    return next(err);
  } else {
    res.send(albumsResponse.albums);
  }
});

// Express 5 automatically forwards rejected promises from async handlers to errorHandler.
// Explicit next(err) is for returned API errors, not thrown ones.

// get_images
router.get(`/${imagesEndpoint}/*album`, async (req, res, next) => {
  const album = req.params.album;
  const locate = Array.isArray(album) ? album.join("/") : album;

  if (!locate) {
    const err = new Error("Bad request: missing album path");
    (err as CustomError).statusCode = 400;
    return next(err);
  }

  const imagesResponse = await getImages(locate);
  if (imagesResponse.error) {
    const err = new Error(imagesResponse.message);
    (err as CustomError).statusCode = imagesResponse.status;
    return next(err);
  }

  res.send(imagesResponse.images);
});

export default router;
