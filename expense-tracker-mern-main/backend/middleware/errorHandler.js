const STATUS_TEXT = {
  400: 'Bad Request',
  404: 'Not Found',
  500: 'Internal Server Error',
};

/**
 * Uniform error body, mirroring the Spring Boot version of this API:
 * { timestamp, status, error, message, path, fieldErrors }
 */
function errorBody(req, status, message, fieldErrors = null) {
  return {
    timestamp: new Date().toISOString(),
    status,
    error: STATUS_TEXT[status] || 'Error',
    message,
    path: req.originalUrl,
    fieldErrors,
  };
}

function notFound(req, res) {
  res.status(404).json(errorBody(req, 404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Mongoose schema validation (incl. bad enum values and cast failures
  // inside a document) -> 400 with per-field messages.
  if (err.name === 'ValidationError') {
    const fieldErrors = {};
    for (const [field, detail] of Object.entries(err.errors)) {
      fieldErrors[field] = detail.message;
    }
    return res.status(400).json(errorBody(req, 400, 'Validation failed', fieldErrors));
  }

  // Invalid ObjectId in the URL, e.g. GET /api/expenses/abc.
  if (err.name === 'CastError') {
    return res
      .status(400)
      .json(errorBody(req, 400, `Invalid value '${err.value}' for parameter '${err.path}'`));
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? 'An unexpected error occurred' : err.message;
  return res.status(status).json(errorBody(req, status, message));
}

module.exports = { errorHandler, notFound, errorBody };
