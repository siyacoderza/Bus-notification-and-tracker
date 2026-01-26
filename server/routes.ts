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

  app.get("/api/reviews", async (req, res) => {
    const reviews = await storage.getAllReviews();
    res.json(reviews);
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

  // === Provinces & Municipalities ===
  app.get("/api/provinces", async (req, res) => {
    const provinces = await storage.getProvinces();
    res.json(provinces);
  });

  app.get("/api/municipalities", async (req, res) => {
    const provinceId = req.query.provinceId ? Number(req.query.provinceId) : undefined;
    const municipalities = await storage.getMunicipalities(provinceId);
    res.json(municipalities);
  });

  // Seed Data
  await seedDatabase();

  // Simulated live bus movement for demo
  setInterval(async () => {
    const routes = await storage.getBusRoutes();
    for (const route of routes) {
      // Sandton area base center
      const centerLat = -26.1076;
      const centerLng = 28.0567;
      
      await storage.updateBusPosition({
        routeId: route.id,
        busId: `BUS-${route.id}-1`,
        lat: (centerLat + (Math.random() - 0.5) * 0.05).toString(),
        lng: (centerLng + (Math.random() - 0.5) * 0.05).toString(),
        speed: Math.floor(Math.random() * 60) + 20,
        bearing: Math.floor(Math.random() * 360)
      });
    }
  }, 5000);

  return httpServer;
}

async function seedDatabase() {
  // Seed provinces and municipalities
  const existingProvinces = await storage.getProvinces();
  if (existingProvinces.length === 0) {
    console.log("Seeding provinces and municipalities...");
    
    // All 9 South African Provinces
    const provinceData = [
      { name: "Eastern Cape", code: "EC" },
      { name: "Free State", code: "FS" },
      { name: "Gauteng", code: "GP" },
      { name: "KwaZulu-Natal", code: "KZN" },
      { name: "Limpopo", code: "LP" },
      { name: "Mpumalanga", code: "MP" },
      { name: "Northern Cape", code: "NC" },
      { name: "North West", code: "NW" },
      { name: "Western Cape", code: "WC" },
    ];

    const createdProvinces: Record<string, number> = {};
    for (const p of provinceData) {
      const province = await storage.createProvince(p);
      createdProvinces[p.code] = province.id;
    }

    // Major Municipalities by Province (8 Metros + Key Districts/Locals)
    const municipalityData = [
      // Eastern Cape
      { name: "Buffalo City", provinceCode: "EC", type: "metro", code: "BUF" },
      { name: "Nelson Mandela Bay", provinceCode: "EC", type: "metro", code: "NMA" },
      { name: "Amathole District", provinceCode: "EC", type: "district", code: "DC12" },
      { name: "Chris Hani District", provinceCode: "EC", type: "district", code: "DC13" },
      { name: "Joe Gqabi District", provinceCode: "EC", type: "district", code: "DC14" },
      { name: "OR Tambo District", provinceCode: "EC", type: "district", code: "DC15" },
      { name: "Alfred Nzo District", provinceCode: "EC", type: "district", code: "DC44" },
      { name: "Sarah Baartman District", provinceCode: "EC", type: "district", code: "DC10" },
      
      // Free State
      { name: "Mangaung", provinceCode: "FS", type: "metro", code: "MAN" },
      { name: "Xhariep District", provinceCode: "FS", type: "district", code: "DC16" },
      { name: "Lejweleputswa District", provinceCode: "FS", type: "district", code: "DC18" },
      { name: "Thabo Mofutsanyana District", provinceCode: "FS", type: "district", code: "DC19" },
      { name: "Fezile Dabi District", provinceCode: "FS", type: "district", code: "DC20" },
      
      // Gauteng
      { name: "City of Johannesburg", provinceCode: "GP", type: "metro", code: "JHB" },
      { name: "City of Tshwane", provinceCode: "GP", type: "metro", code: "TSH" },
      { name: "Ekurhuleni", provinceCode: "GP", type: "metro", code: "EKU" },
      { name: "Sedibeng District", provinceCode: "GP", type: "district", code: "DC42" },
      { name: "West Rand District", provinceCode: "GP", type: "district", code: "DC48" },
      
      // KwaZulu-Natal
      { name: "eThekwini", provinceCode: "KZN", type: "metro", code: "ETH" },
      { name: "Ugu District", provinceCode: "KZN", type: "district", code: "DC21" },
      { name: "uMgungundlovu District", provinceCode: "KZN", type: "district", code: "DC22" },
      { name: "Uthukela District", provinceCode: "KZN", type: "district", code: "DC23" },
      { name: "Umzinyathi District", provinceCode: "KZN", type: "district", code: "DC24" },
      { name: "Amajuba District", provinceCode: "KZN", type: "district", code: "DC25" },
      { name: "Zululand District", provinceCode: "KZN", type: "district", code: "DC26" },
      { name: "Umkhanyakude District", provinceCode: "KZN", type: "district", code: "DC27" },
      { name: "King Cetshwayo District", provinceCode: "KZN", type: "district", code: "DC28" },
      { name: "iLembe District", provinceCode: "KZN", type: "district", code: "DC29" },
      { name: "Harry Gwala District", provinceCode: "KZN", type: "district", code: "DC43" },
      
      // Limpopo
      { name: "Mopani District", provinceCode: "LP", type: "district", code: "DC33" },
      { name: "Vhembe District", provinceCode: "LP", type: "district", code: "DC34" },
      { name: "Capricorn District", provinceCode: "LP", type: "district", code: "DC35" },
      { name: "Waterberg District", provinceCode: "LP", type: "district", code: "DC36" },
      { name: "Sekhukhune District", provinceCode: "LP", type: "district", code: "DC47" },
      
      // Mpumalanga
      { name: "Gert Sibande District", provinceCode: "MP", type: "district", code: "DC30" },
      { name: "Nkangala District", provinceCode: "MP", type: "district", code: "DC31" },
      { name: "Ehlanzeni District", provinceCode: "MP", type: "district", code: "DC32" },
      
      // Northern Cape
      { name: "Frances Baard District", provinceCode: "NC", type: "district", code: "DC9" },
      { name: "Pixley ka Seme District", provinceCode: "NC", type: "district", code: "DC7" },
      { name: "ZF Mgcawu District", provinceCode: "NC", type: "district", code: "DC8" },
      { name: "Namakwa District", provinceCode: "NC", type: "district", code: "DC6" },
      { name: "John Taolo Gaetsewe District", provinceCode: "NC", type: "district", code: "DC45" },
      
      // North West
      { name: "Bojanala Platinum District", provinceCode: "NW", type: "district", code: "DC37" },
      { name: "Ngaka Modiri Molema District", provinceCode: "NW", type: "district", code: "DC38" },
      { name: "Dr Ruth Segomotsi Mompati District", provinceCode: "NW", type: "district", code: "DC39" },
      { name: "Dr Kenneth Kaunda District", provinceCode: "NW", type: "district", code: "DC40" },
      
      // Western Cape
      { name: "City of Cape Town", provinceCode: "WC", type: "metro", code: "CPT" },
      { name: "West Coast District", provinceCode: "WC", type: "district", code: "DC1" },
      { name: "Cape Winelands District", provinceCode: "WC", type: "district", code: "DC2" },
      { name: "Overberg District", provinceCode: "WC", type: "district", code: "DC3" },
      { name: "Eden District", provinceCode: "WC", type: "district", code: "DC4" },
      { name: "Central Karoo District", provinceCode: "WC", type: "district", code: "DC5" },
    ];

    for (const m of municipalityData) {
      await storage.createMunicipality({
        name: m.name,
        provinceId: createdProvinces[m.provinceCode],
        type: m.type,
        code: m.code,
      });
    }

    // Create welcome notification
    await storage.createNotification({
      routeId: null,
      type: "info",
      message: "Welcome to MzansiMove! Add your bus routes to get started.",
      activeUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    console.log("Seeding complete: 9 provinces, " + municipalityData.length + " municipalities added.");
  }
}
