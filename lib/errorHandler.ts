import chalk from "chalk";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).send({ error: true, status: err.statusCode, message: err.message });
};

export const logError = (message: string) => {
  console.error(chalk.redBright(`        ${message}`));
};

export default errorHandler;
