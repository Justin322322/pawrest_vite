import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to debug session issues
 */
export function sessionDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  // Log session ID
  console.log(`Session ID: ${req.sessionID || 'none'}`);
  
  // Log authentication status
  console.log(`Authenticated: ${req.isAuthenticated()}`);
  
  // Log session data (without sensitive info)
  if (req.session) {
    const sessionCopy = { ...req.session };
    if (sessionCopy.passport && sessionCopy.passport.user) {
      console.log(`Session user ID: ${sessionCopy.passport.user}`);
    } else {
      console.log('No user in session');
    }
    
    // Log cookie settings
    if (req.session.cookie) {
      console.log('Session cookie settings:', {
        maxAge: req.session.cookie.maxAge,
        httpOnly: req.session.cookie.httpOnly,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite
      });
    }
  } else {
    console.log('No session object');
  }
  
  // Continue with request
  next();
}
