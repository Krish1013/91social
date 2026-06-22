/**
 * Central error handler middleware.
 * All errors thrown in route handlers are caught here.
 * Keeps controllers clean — they just throw, this formats the response.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Known application errors
  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code || 'APP_ERROR'
    });
  }

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT_CHECK') {
    return res.status(400).json({
      error: 'Data violates a database constraint. Check values and try again.',
      code: 'CONSTRAINT_ERROR'
    });
  }

  // Unexpected errors — log and return generic message
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    error: 'An unexpected error occurred. Please try again.',
    code: 'INTERNAL_ERROR'
  });
}

/**
 * Factory for consistent application errors.
 * Usage: throw createError(404, 'Bicycle not found', 'NOT_FOUND')
 */
function createError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code || 'APP_ERROR';
  return err;
}

module.exports = { errorHandler, createError };
