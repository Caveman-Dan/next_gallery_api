const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).send({ message: err.message, error: true });
};

export default errorHandler;
