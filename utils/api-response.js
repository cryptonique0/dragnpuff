/**
 * API Response Builder
 * Standardizes API response format
 */

/**
 * Build success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {object} Formatted response
 */
function success(data, message = "Success", statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} details - Error details
 * @returns {object} Formatted response
 */
function error(message, statusCode = 400, details = null) {
  return {
    success: false,
    statusCode,
    message,
    error: details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build paginated response
 * @param {Array} items - Items in page
 * @param {number} page - Current page
 * @param {number} pageSize - Items per page
 * @param {number} total - Total items
 * @returns {object} Paginated response
 */
function paginated(items, page, pageSize, total) {
  const totalPages = Math.ceil(total / pageSize);
  
  return success(
    {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
    "Paginated results retrieved successfully"
  );
}

/**
 * Build list response
 * @param {Array} items - Array of items
 * @param {number} count - Total count
 * @returns {object} List response
 */
function list(items, count = null) {
  return success(
    {
      items,
      count: count || items.length,
    },
    "Items retrieved successfully"
  );
}

/**
 * Build created response
 * @param {any} data - Created resource
 * @param {string} message - Message
 * @returns {object} Created response
 */
function created(data, message = "Resource created successfully") {
  return success(data, message, 201);
}

/**
 * Build updated response
 * @param {any} data - Updated resource
 * @param {string} message - Message
 * @returns {object} Updated response
 */
function updated(data, message = "Resource updated successfully") {
  return success(data, message, 200);
}

/**
 * Build deleted response
 * @param {string} message - Message
 * @returns {object} Deleted response
 */
function deleted(message = "Resource deleted successfully") {
  return success(null, message, 204);
}

/**
 * Build validation error response
 * @param {object} errors - Validation errors
 * @returns {object} Validation error response
 */
function validationError(errors) {
  return error("Validation failed", 422, errors);
}

/**
 * Build not found response
 * @param {string} resource - Resource name
 * @returns {object} Not found response
 */
function notFound(resource = "Resource") {
  return error(`${resource} not found`, 404);
}

/**
 * Build unauthorized response
 * @returns {object} Unauthorized response
 */
function unauthorized() {
  return error("Unauthorized", 401);
}

/**
 * Build forbidden response
 * @returns {object} Forbidden response
 */
function forbidden() {
  return error("Forbidden", 403);
}

/**
 * Build server error response
 * @param {string} message - Error message
 * @returns {object} Server error response
 */
function serverError(message = "Internal server error") {
  return error(message, 500);
}

module.exports = {
  success,
  error,
  paginated,
  list,
  created,
  updated,
  deleted,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  serverError,
};
