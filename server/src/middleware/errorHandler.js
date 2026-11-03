const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error internally in development mode
  if (env.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  }

  // Handle malformed JSON request bodies
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new ApiError(400, 'Invalid JSON payload in request body');
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(400, 'Validation failed', details);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational
    ? error.message
    : 'Internal Server Error. Please try again later.';

  const responsePayload = {
    success: false,
    error: {
      message,
      ...(error.details && error.details.length > 0 ? { details: error.details } : {}),
    },
  };

  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
