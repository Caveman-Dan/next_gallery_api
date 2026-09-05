import chalk from "chalk";

export const logError = (message: string) => {
  console.error(chalk.redBright(`        ${message}`));
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  logError(`${req.method} ${req.originalUrl} → ${status}: ${err.message}`);
  res.status(status).send({ error: true, status, message: err.message });
};

export default errorHandler;
