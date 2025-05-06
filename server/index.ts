import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testConnection, initDatabase, createDatabaseIfNotExists } from "./db";
import { errorHandler } from "./error-handler";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize MySQL database if using MySQL
  if (process.env.USE_MYSQL === 'true' || process.env.NODE_ENV === 'production') {
    try {
      // First, create the database if it doesn't exist
      log('Creating database if it does not exist...');
      const dbCreated = await createDatabaseIfNotExists();

      if (dbCreated) {
        // Test database connection
        const connected = await testConnection();
        if (connected) {
          log('MySQL connection successful');

          // Initialize database tables
          const initialized = await initDatabase();
          if (initialized) {
            log('MySQL database initialized successfully');
          } else {
            log('Failed to initialize MySQL database');
          }
        } else {
          log('Failed to connect to MySQL database');
        }
      } else {
        log('Failed to create MySQL database');
      }
    } catch (error) {
      console.error('Error initializing MySQL:', error);
    }
  }

  const server = await registerRoutes(app);

  // Add global error handler middleware (must be after routes)
  app.use(errorHandler);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  const port = 5000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
