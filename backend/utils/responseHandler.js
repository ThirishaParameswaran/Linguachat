/**
 * Standardized Response Formatter
 * Ensures uniform JSON structure across all REST API endpoints.
 */
export const sendSuccess = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...data // Spread data at root level for seamless frontend access where needed
  });
};

export const sendError = (res, message = 'An error occurred', errorCode = 'INTERNAL_ERROR', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode
  });
};
