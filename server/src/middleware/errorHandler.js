/**
 * 404 Not Found Handler
 * Catches requests to non-existent routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 * Converts known error types into clean, consistent JSON responses
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'An unexpected server error occurred';

  // ── Mongoose: Bad ObjectId ───────────────────────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found: the provided ID is invalid';
  }

  // ── Mongoose: Duplicate Key (unique index violation) ─────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    message = `A record with this ${field} (${value}) already exists`;
  }

  // ── Mongoose: Schema Validation Error ────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ');
  }

  // ── JWT: Invalid Token ────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  // ── JWT: Expired Token ────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ── Multer: File upload errors ────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'Uploaded file is too large. Maximum allowed size is 5MB.';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field. Please check the upload field name.';
  }

  // ── SyntaxError: Malformed JSON body ─────────────────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
