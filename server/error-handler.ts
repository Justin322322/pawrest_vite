import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware for Express
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Server error:", err);
  
  // Default error message
  let statusCode = 500;
  let errorMessage = "Internal server error";
  let userFriendlyMessage = "Something went wrong on our end. Please try again later.";
  
  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    errorMessage = err.message;
    userFriendlyMessage = "Please check your input and try again.";
  } 
  else if (err.name === "UnauthorizedError" || err.message.includes("unauthorized")) {
    statusCode = 401;
    errorMessage = "Unauthorized";
    userFriendlyMessage = "You need to log in to access this resource.";
  }
  else if (err.name === "ForbiddenError" || err.message.includes("forbidden")) {
    statusCode = 403;
    errorMessage = "Forbidden";
    userFriendlyMessage = "You don't have permission to access this resource.";
  }
  else if (err.name === "NotFoundError" || err.message.includes("not found")) {
    statusCode = 404;
    errorMessage = "Not found";
    userFriendlyMessage = "The requested resource was not found.";
  }
  
  // Handle database errors
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    errorMessage = "Duplicate entry";
    userFriendlyMessage = "This username or email is already registered. Please use a different one.";
  }
  
  // Send the error response
  res.status(statusCode).json({
    error: errorMessage,
    message: userFriendlyMessage,
    // Include stack trace in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
