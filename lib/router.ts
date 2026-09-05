import "dotenv/config";
import express from "express";

import { getAlbums, getImages } from "./fileAccess.ts";

import type { CustomError } from "./definitions.ts";

const router = express.Router();

// status
router.get(`/${process.env.GET_STATUS_ENDPOINT}`, (req, res, next) => {
  res.send("status_ok");
});

// get_albums
router.get(`/${process.env.GET_ALBUMS_ENDPOINT}`, async (req, res, next) => {
  const albums = await getAlbums();
  res.send(albums);
});

// get_images
router.get(`/${process.env.GET_IMAGES_ENDPOINT}`, async (req, res, next) => {
  if (req.query.locate) {
    const imagesResponse = await getImages(req.query.locate);
    if (imagesResponse.error) {
      const err = new Error(imagesResponse.message);
      (err as CustomError).statusCode = imagesResponse.status;
      next(err);
    } else {
      res.send(imagesResponse.images);
    }
  } else {
    const err = new Error("Bad request: missing parameters");
    (err as CustomError).statusCode = 400;
    next(err);
  }
});

export default router;
