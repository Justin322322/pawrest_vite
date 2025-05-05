import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { serviceTypes, testimonials, faqs } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  const { isClient, isProvider, isAdmin } = setupAuth(app);

  // Public API routes
  app.get("/api/services", (req, res) => {
    res.json(serviceTypes);
  });

  app.get("/api/testimonials", (req, res) => {
    res.json(testimonials);
  });

  app.get("/api/faqs", (req, res) => {
    res.json(faqs);
  });

  // Client routes
  app.get("/api/client/bookings", isClient, async (req, res, next) => {
    try {
      const bookings = await storage.getBookingsByClientId(req.user!.id);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/client/bookings", isClient, async (req, res, next) => {
    try {
      const booking = await storage.createBooking({
        ...req.body,
        clientId: req.user!.id,
      });
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  });

  // Provider routes
  app.get("/api/provider/services", isProvider, async (req, res, next) => {
    try {
      const services = await storage.getServicesByProviderId(req.user!.id);
      res.json(services);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/provider/services", isProvider, async (req, res, next) => {
    try {
      const service = await storage.createService({
        ...req.body,
        providerId: req.user!.id,
      });
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/provider/bookings", isProvider, async (req, res, next) => {
    try {
      const bookings = await storage.getBookingsByProviderId(req.user!.id);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/provider/bookings/:id", isProvider, async (req, res, next) => {
    try {
      const { id } = req.params;
      const booking = await storage.updateBookingStatus(parseInt(id), req.body.status);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/users/:id/verify", isAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await storage.verifyProvider(parseInt(id));
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/bookings", isAdmin, async (req, res, next) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
