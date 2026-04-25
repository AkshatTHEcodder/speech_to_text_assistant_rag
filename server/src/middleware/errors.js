function notFound(_req, res) {
  res.status(404).json({ error: "Not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = Number(err.status || 500);
  const message = status >= 500 ? "Server error" : err.message;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" ? { details: err.message } : {})
  });
}

module.exports = { notFound, errorHandler };

