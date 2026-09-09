import "dotenv/config";
import path from "path";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import config from "./config";
import router from "./lib/router";
import { faviconRequest, logger, acceptedExtensions } from "./lib/middleware";
import errorHandler from "./lib/errorHandling";
import { transformImage } from "./lib/imageProcessing/imageTransform";

const app: Express = express();

if (config.rateLimit.trustProxy) {
  app.set("trust proxy", 1);
}

app.use(helmet());

const { windowMs } = config.rateLimit;

app.use(
  `/${process.env.API_EXTENSION}`,
  rateLimit({ windowMs, limit: config.rateLimit.api, standardHeaders: "draft-8", legacyHeaders: false })
);

app.use(
  path.join(`/${process.env.API_EXTENSION}`, process.env.GET_IMAGES_ENDPOINT as string),
  rateLimit({ windowMs, limit: config.rateLimit.getImages, standardHeaders: "draft-8", legacyHeaders: false })
);

const dir = path.join(__dirname, process.env.IMAGES_FOLDER as string);
const httpEndpoints = config.httpConfig.restrictedEndpoints.map((item) =>
  path.join(process.env.API_EXTENSION as string, item as string)
);

app.use(logger(config.logging.active, config.logging.excludedRoutes, console.log));
app.use(faviconRequest);
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [] }));
app.use(`/${process.env.API_EXTENSION}`, router);
app.use(acceptedExtensions(config.httpConfig.acceptedExt, httpEndpoints));
app.use(
  path.join(`/${process.env.API_EXTENSION}`, process.env.GET_IMAGE_ENDPOINT as string),
  rateLimit({
    windowMs,
    limit: config.rateLimit.transform,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.query.w === undefined,
  }),
  transformImage,
  express.static(dir, config.httpConfig)
);
app.use(errorHandler);
app.listen(config.port);

console.log(`Node server listening on port: ${config.port}`);
