const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    errors = Object.values(err.errors).map(({ path, message: fieldMessage }) => ({
      field: path,
      message: fieldMessage,
    }));
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    statusCode = 409;
    message = "A resource with the same unique value already exists.";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });
};

export default errorMiddleware;