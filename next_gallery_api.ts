import "dotenv/config";
import path from "path";
import express, { Express } from "express";
import cors from "cors";

import config from "./config.js";
import router from "./lib/router.js";
import { faviconRequest, logger, acceptedExtensions } from "./lib/middleware.js";
import errorHandler from "./lib/errorHandler.js";

const app: Express = express();

const dir = path.join(__dirname, process.env.IMAGES_FOLDER as string);
const httpEndpoints = config.httpConfig.restrictedEndpoints.map((item) =>
  path.join(process.env.API_EXTENSION as string, item as string)
);

app.use(logger(config.logging, console.log));
app.use(faviconRequest);
app.use(express.json());
app.use(cors());
app.use(`/${process.env.API_EXTENSION}`, router);
app.use(acceptedExtensions(config.httpConfig.acceptedExt, httpEndpoints));
app.use(
  path.join(`/${process.env.API_EXTENSION}`, process.env.GET_IMAGE_ENDPOINT as string),
  express.static(dir, config.httpConfig)
);
app.use(errorHandler);
app.listen(config.port);

console.log(`Node server listening on port: ${config.port}`);
