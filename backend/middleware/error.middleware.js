const errorHandler = (err, req, res, next) => {
  // Avoid leaking stack traces in production
  const status = err.status || 500;
  const message =
    status === 500 ? "Internal Server Error" : err.message || "Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({ message });
};

export default errorHandler;
