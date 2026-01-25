import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertReviewSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Routes ===

  app.get(api.routes.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const routes = await storage.getBusRoutes(search);
    
    // Calculate waiting counts for each route based on subscriptions
    const routesWithCounts = await Promise.all(routes.map(async (route) => {
      const subs = await storage.getRouteSubscriptions(route.id);
      return {
        ...route,
        waitingCount: subs.length
      };
    }));
    
    res.json(routesWithCounts);
  });

  app.get("/api/routes/:id/reviews", async (req, res) => {
    const routeId = Number(req.params.id);
    const reviews = await storage.getRouteReviews(routeId);
    res.json(reviews);
  });

  app.post("/api/routes/:id/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const routeId = Number(req.params.id);
      const userId = req.user.claims.sub;
      const input = insertReviewSchema.parse({
        ...req.body,
        routeId,
        userId
      });
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).send("Error creating review");
    }
  });

  app.post("/api/routes/:id/wait", async (req, res) => {
    const routeId = Number(req.params.id);
    const route = await storage.getBusRoute(routeId);
    if (!route) return res.status(404).send("Route not found");
    
    const updated = await storage.updateBusRoute(routeId, {
      waitingCount: (route.waitingCount || 0) + 1
    });
    res.json(updated);
  });

  app.get(api.routes.get.path, async (req, res) => {
    const route = await storage.getBusRoute(Number(req.params.id));
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  });

  // Admin routes (Protected)
  // For MVP, just checking if authenticated. In real app, check isAdmin role.
  app.post(api.routes.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.routes.create.input.parse(req.body);
      const route = await storage.createBusRoute(input);
      res.status(201).json(route);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.routes.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.routes.update.input.parse(req.body);
      const route = await storage.updateBusRoute(Number(req.params.id), input);
      res.json(route);
    } catch (err) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  app.delete(api.routes.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteBusRoute(Number(req.params.id));
    res.status(204).send();
  });

  // === Notifications ===

  app.get(api.notifications.list.path, async (req, res) => {
    // In future, filter by userId if provided in query or auth
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });

  app.post(api.notifications.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.notifications.create.input.parse(req.body);
      const notification = await storage.createNotification(input);
      res.status(201).json(notification);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Subscriptions ===

  app.get(api.subscriptions.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const subs = await storage.getSubscriptions(userId);
    res.json(subs);
  });

  app.post(api.subscriptions.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.subscriptions.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const sub = await storage.createSubscription(userId, input.routeId);
      res.status(201).json(sub);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.subscriptions.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const routeId = Number(req.params.routeId);
    await storage.deleteSubscription(userId, routeId);
    res.status(204).send();
  });

  // === User Preferences ===
  app.post("/api/user/preferences/pin/:id", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const routeId = Number(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).send("User not found");

    const pinned = user.pinnedRoutes || [];
    const newPinned = pinned.includes(routeId) 
      ? pinned.filter((id: number) => id !== routeId)
      : [...pinned, routeId];
    
    await storage.updateUserPreferences(userId, newPinned, user.hiddenRoutes || []);
    res.json({ pinnedRoutes: newPinned });
  });

  app.post("/api/user/preferences/hide/:id", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const routeId = Number(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).send("User not found");

    const hidden = user.hiddenRoutes || [];
    const newHidden = hidden.includes(routeId)
      ? hidden.filter((id: number) => id !== routeId)
      : [...hidden, routeId];
    
    await storage.updateUserPreferences(userId, user.pinnedRoutes || [], newHidden);
    res.json({ hiddenRoutes: newHidden });
  });

  app.get("/api/routes/:id/messages", async (req, res) => {
    const routeId = Number(req.params.id);
    const messages = await storage.getRouteMessages(routeId);
    res.json(messages);
  });

  app.post("/api/routes/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const routeId = Number(req.params.id);
      const userId = req.user.claims.sub;
      const input = {
        routeId,
        userId,
        content: req.body.content
      };
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      res.status(500).send("Error sending message");
    }
  });

  app.get("/api/routes/:id/positions", async (req, res) => {
    const routeId = Number(req.params.id);
    const positions = await storage.getBusPositions(routeId);
    res.json(positions);
  });

  // Seed Data
  await seedDatabase();

  // Simulated live bus movement for demo
  setInterval(async () => {
    const routes = await storage.getBusRoutes();
    for (const route of routes) {
      await storage.updateBusPosition({
        routeId: route.id,
        busId: `BUS-${route.id}-1`,
        lat: (-26.1076 + (Math.random() - 0.5) * 0.01).toString(),
        lng: (28.0567 + (Math.random() - 0.5) * 0.01).toString(),
        speed: Math.floor(Math.random() * 60) + 20,
        bearing: Math.floor(Math.random() * 360)
      });
    }
  }, 5000);

  return httpServer;
}

async function seedDatabase() {
  const routes = await storage.getBusRoutes();
  if (routes.length === 0) {
    console.log("Seeding database...");
    
    // Create Routes
    const r1 = await storage.createBusRoute({
      name: "T01: Sandton to CBD",
      description: "Express service via M1 Highway",
      startLocation: "Sandton Station",
      endLocation: "Gandhi Square",
      operatingCompany: "Rea Vaya",
      isActive: true,
      frequency: "Every 15 mins",
      schedule: ["06:00", "06:15", "06:30", "06:45", "07:00"]
    });

    const r2 = await storage.createBusRoute({
      name: "C01: Waterfront to Camps Bay",
      description: "Scenic coastal route",
      startLocation: "V&A Waterfront",
      endLocation: "Camps Bay Beach",
      operatingCompany: "MyCiTi",
      isActive: true,
      frequency: "Every 20 mins",
      schedule: ["07:00", "07:20", "07:40", "08:00"]
    });

    const r3 = await storage.createBusRoute({
      name: "P05: Hatfield to Pretoria Central",
      description: "University express shuttle",
      startLocation: "Hatfield Gautrain",
      endLocation: "Church Square",
      operatingCompany: "A Re Yeng",
      isActive: true,
      frequency: "Every 10 mins",
      schedule: ["06:00", "06:10", "06:20", "06:30"]
    });

    // Create Notifications
    await storage.createNotification({
      routeId: r1.id,
      type: "delay",
      message: "Heavy traffic on M1 South. Expect 20 min delays.",
      activeUntil: new Date(Date.now() + 1000 * 60 * 60 * 2) // 2 hours
    });

    await storage.createNotification({
      routeId: null, // System-wide
      type: "info",
      message: "New fare prices effective from 1st Feb.",
      activeUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    });
    
    console.log("Seeding complete.");
  }
}
