/**
 * Error Handling Utilities
 */

class AppError extends Error {
  constructor(message, code = "INTERNAL_ERROR", statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, "NOT_FOUND", 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, "UNAUTHORIZED", 401);
  }
}

/**
 * Handle error and return formatted response
 * @param {Error} error - Error object
 * @returns {object}
 */
function handleError(error) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  return {
    success: false,
    error: error.message || "Unknown error",
    code: "INTERNAL_ERROR",
    statusCode: 500,
  };
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  handleError,
};
