import "dotenv/config";
import express from "express";
import chalk from "chalk";

import { getAlbums, getImages } from "./fileAccess.ts";

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
      console.error(chalk.redBright(`        get_image status: ${imagesResponse.status} - ${imagesResponse.message}`));

      const err = new Error(imagesResponse.message);
      err.statusCode = imagesResponse.status;
      next(err);
    } else {
      res.send(imagesResponse.images);
    }
  } else res.status(400).send({ message: "Bad request: missing parameters" });
});

export default router;
