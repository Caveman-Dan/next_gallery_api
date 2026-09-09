import "dotenv/config";
import path from "path";
import chalk from "chalk";

import type { RequestHandler, Response } from "express";
import type { CustomError } from "./definitions";

export const faviconRequest: RequestHandler = (req, res, next) => {
  if (req.originalUrl && req.originalUrl.split("/").pop() === "favicon.ico") {
    console.log(chalk.yellowBright("        No content - favicon.ico"));
    return res.sendStatus(204);
  }
  next();
};

export const logger =
  (logging: boolean, excludedRoutes: string[], log: (message: string) => void): RequestHandler =>
  (req, res, next) => {
    if (logging && !excludedRoutes.includes(req.originalUrl.replace(`/${process.env.API_EXTENSION}`, ""))) {
      const end = res.end.bind(res);

      res.end = ((...restArgs: never[]) => {
        log(`
        Request:
          time: ${new Date().toUTCString()},
          fromIP: ${req.ip},
          method: ${req.method},
          URI: ${req.originalUrl},
          requestData: ${JSON.stringify(req.body)},
          userAgent: ${req.headers["user-agent"]},
        Response:
          ${
            res.statusCode === 200
              ? `status: ${res.statusCode}`
              : res.statusCode > 200 && res.statusCode < 300
              ? chalk.yellowBright(`status: ${res.statusCode}`)
              : chalk.redBright(`status: ${res.statusCode}`)
          },
      `);
        return end(...restArgs);
      }) as Response["end"];
    }

    next();
  };

export const acceptedExtensions =
  (allowed: string[], restrictedEndpoints: (string | undefined)[]): RequestHandler =>
  (req, res, next) => {
    const extension = path.extname(req.path).replace(".", "");
    const restricted = restrictedEndpoints.some((item) => req.path.includes(`${item}/`));
    const extensionRejected = !allowed.includes(extension.toLocaleLowerCase());

    if (restricted && extensionRejected) {
      const err = new Error(`Forbidden file extension: ${decodeURIComponent(req.path)}`);
      (err as CustomError).statusCode = 403;
      err.stack = "";
      return next(err);
    }
    next();
  };
