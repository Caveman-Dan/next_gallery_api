import chalk from "chalk";

import type { ErrorRequestHandler } from "express";
import type { CustomError } from "./definitions";

export const logError = (message: string) => {
  console.error(chalk.redBright(`        ${message}`));
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = (err as CustomError).statusCode || 500;
  const message = err instanceof Error ? err.message : String(err);
  logError(`${req.method} ${req.originalUrl} → ${status}: ${message}`);
  res.status(status).send({ error: true, status, message });
};

export default errorHandler;
