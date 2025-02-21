import "dotenv/config";
import path from "path";
import chalk from "chalk";

import config from "../config";

export const faviconRequest = (req, res, next) => {
  if (req.originalUrl && req.originalUrl.split("/").pop() === "favicon.ico") {
    return res.sendStatus(204);
  }
  next();
};

export const logger = (logging, logger) => (req, res, next) => {
  if (logging) {
    const end = res.end;

    res.end = (...restArgs) => {
      logger(`
        Request:
          time: ${new Date().toUTCString()},
          fromIP: ${req.ip},
          method: ${req.method},
          URI: ${req.originalUrl},
          requestData: ${JSON.stringify(req.body)},
          userAgent: ${req.headers["user-agent"]},
        Response:
          ${res.statusCode === 200 ? `status: ${res.statusCode}` : chalk.redBright(`status: ${res.statusCode}`)},
      `);

      end.apply(res, restArgs);
    };
  }

  next();
};

export const acceptedExtensions = (acceptedExtensions, restrictedEndpoints) => (req, res, next) => {
  const extension = path.extname(req.path).replace(".", "");
  const restricted = restrictedEndpoints.some((item) => req.path.includes(`${item}/`));
  const extensionRejected = !acceptedExtensions.includes(extension.toLocaleLowerCase());

  if (restricted && extensionRejected) {
    res.status(403).send({ message: "Forbidden file!" });
  }
  next();
};
