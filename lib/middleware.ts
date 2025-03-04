import "dotenv/config";
import path from "path";
import chalk from "chalk";

export const faviconRequest = (req, res, next) => {
  if (req.originalUrl && req.originalUrl.split("/").pop() === "favicon.ico") {
    console.log(chalk.yellowBright("        No content - favicon.ico"));
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
          ${
            res.statusCode === 200
              ? `status: ${res.statusCode}`
              : res.statusCode > 200 && res.statusCode < 300
              ? chalk.yellowBright(`status: ${res.statusCode}`)
              : chalk.redBright(`status: ${res.statusCode}`)
          },
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
    console.error(chalk.redBright(`        Forbidden file extension: ${decodeURIComponent(req.path)}`));
    const err = new Error(`Forbidden file extension: ${decodeURIComponent(req.path)}`);
    err.statusCode = 403;
    err.stack = "";
    next(err);
  }
  next();
};
