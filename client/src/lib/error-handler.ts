/**
 * Converts technical error messages into user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: Error | unknown): string {
  if (!error) return "An unknown error occurred. Please try again.";
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Handle specific error codes and messages
  if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
    return "Invalid username or password. Please try again.";
  }
  
  if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
    return "You don't have permission to access this resource.";
  }
  
  if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
    return "The requested resource was not found.";
  }
  
  if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
    return "Something went wrong on our end. Please try again later.";
  }
  
  if (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  
  // Handle specific authentication errors
  if (errorMessage.includes("Invalid username or password")) {
    return "The username or password you entered is incorrect. Please try again.";
  }
  
  if (errorMessage.includes("User already exists") || 
      errorMessage.includes("duplicate key") || 
      errorMessage.includes("already taken")) {
    return "This username or email is already registered. Please use a different one or try logging in.";
  }
  
  if (errorMessage.includes("Password") && 
      (errorMessage.includes("weak") || errorMessage.includes("requirements"))) {
    return "Your password doesn't meet the security requirements. Please use a stronger password.";
  }
  
  if (errorMessage.includes("Email") && errorMessage.includes("valid")) {
    return "Please enter a valid email address.";
  }
  
  if (errorMessage.includes("required")) {
    return "Please fill in all required fields.";
  }
  
  // Default message for unhandled errors
  return "Something went wrong. Please try again or contact support if the problem persists.";
}
