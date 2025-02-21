import "dotenv/config";
import express from "express";

import { getAlbums, getImages } from "./lib/fileAccess.ts";

const router = express.Router();

router.get(`/${process.env.GET_STATUS_ENDPOINT}`, (req, res, next) => {
  res.send("status_ok");
});

router.get(`/${process.env.GET_ALBUMS_ENDPOINT}`, async (req, res, next) => {
  const albums = await getAlbums();
  res.send(albums);
});

router.get(`/${process.env.GET_IMAGES_ENDPOINT}`, async (req, res, next) => {
  if (req.query.locate) {
    const imagesResponse = await getImages(req.query.locate);
    if (imagesResponse.error) {
      switch (imagesResponse.status) {
        case 400: {
          res.status(400).send({ message: imagesResponse.message });
          break;
        }
        case 404: {
          res.status(404).send({ message: imagesResponse.message });
          break;
        }
        case 500: {
          res.status(500).send({ message: imagesResponse.message });
        }
      }
    } else {
      res.send(imagesResponse.images);
    }
  } else res.status(400).send({ message: "Bad request: missing parameters" });
});

export default router;
