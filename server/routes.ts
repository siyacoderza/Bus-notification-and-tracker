import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertReviewSchema, insertJobSchema, insertAdvertisementSchema, insertAdvertiserApplicationSchema } from "@shared/schema";

const isDriverVerified = (req: any, res: Response, next: NextFunction) => {
  if (req.session?.isDriver) {
    next();
  } else {
    res.status(403).json({ message: "Driver access required. Please enter your driver PIN." });
  }
};

const isAdminVerified = (req: any, res: Response, next: NextFunction) => {
  if (req.session?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access required. Please enter your admin PIN." });
  }
};

const isAdvertiserVerified = (req: any, res: Response, next: NextFunction) => {
  if (req.session?.advertiserId) {
    next();
  } else {
    res.status(403).json({ message: "Advertiser access required. Please log in with your email and PIN." });
  }
};

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

  // Operator routes (Protected by PIN verification)
  app.post(api.routes.create.path, isAdminVerified, async (req, res) => {
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

  app.put(api.routes.update.path, isAdminVerified, async (req, res) => {
    try {
      const input = api.routes.update.input.parse(req.body);
      const route = await storage.updateBusRoute(Number(req.params.id), input);
      res.json(route);
    } catch (err) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  app.delete(api.routes.delete.path, isAdminVerified, async (req, res) => {
    await storage.deleteBusRoute(Number(req.params.id));
    res.status(204).send();
  });

  // === Notifications ===

  app.get(api.notifications.list.path, async (req, res) => {
    // In future, filter by userId if provided in query or auth
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });

  app.post(api.notifications.create.path, isAdminVerified, async (req, res) => {
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

  // === Driver PIN Verification ===
  app.post("/api/verify-driver-pin", (req: any, res) => {
    const { pin } = req.body;
    const driverPin = process.env.OPERATOR_PIN;
    
    if (!driverPin) {
      return res.status(500).json({ success: false, message: "Driver PIN not configured" });
    }
    
    if (pin === driverPin) {
      req.session.isDriver = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid PIN" });
    }
  });

  app.post("/api/exit-driver-mode", (req: any, res) => {
    req.session.isDriver = false;
    res.json({ success: true });
  });

  app.get("/api/driver-status", (req: any, res) => {
    res.json({ isDriver: !!req.session?.isDriver });
  });

  // === Admin PIN Verification ===
  app.post("/api/verify-admin-pin", (req: any, res) => {
    const { pin } = req.body;
    const adminPin = process.env.ADMIN_PIN;
    
    if (!adminPin) {
      return res.status(500).json({ success: false, message: "Admin PIN not configured" });
    }
    
    if (pin === adminPin) {
      req.session.isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid PIN" });
    }
  });

  app.post("/api/exit-admin-mode", (req: any, res) => {
    req.session.isAdmin = false;
    res.json({ success: true });
  });

  app.get("/api/admin-status", (req: any, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  // === Jobs API ===
  app.get("/api/jobs", async (req, res) => {
    const activeOnly = req.query.active !== "false";
    const jobs = await storage.getJobs(activeOnly);
    res.json(jobs);
  });

  app.get("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  });

  app.post("/api/jobs", isAdminVerified, async (req, res) => {
    try {
      const input = insertJobSchema.parse(req.body);
      const job = await storage.createJob(input);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/jobs/:id", isAdminVerified, async (req, res) => {
    try {
      const job = await storage.updateJob(Number(req.params.id), req.body);
      res.json(job);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/jobs/:id", isAdminVerified, async (req, res) => {
    await storage.deleteJob(Number(req.params.id));
    res.status(204).send();
  });

  // === Advertisements API ===
  app.get("/api/advertisements", async (req, res) => {
    const activeOnly = req.query.active !== "false";
    const ads = await storage.getAdvertisements(activeOnly);
    res.json(ads);
  });

  app.get("/api/advertisements/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid advertisement ID" });
    }
    const ad = await storage.getAdvertisement(id);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.json(ad);
  });

  app.get("/api/routes/:id/advertisements", async (req, res) => {
    const routeId = Number(req.params.id);
    if (isNaN(routeId)) {
      return res.status(400).json({ message: "Invalid route ID" });
    }
    const ads = await storage.getActiveAdsForRoute(routeId);
    res.json(ads);
  });

  app.post("/api/advertisements", isAdminVerified, async (req, res) => {
    try {
      const input = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(input);
      res.status(201).json(ad);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/advertisements/:id", isAdminVerified, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid advertisement ID" });
      }
      const partialSchema = insertAdvertisementSchema.partial();
      const updates = partialSchema.parse(req.body);
      const ad = await storage.updateAdvertisement(id, updates);
      res.json(ad);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/advertisements/:id", isAdminVerified, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid advertisement ID" });
    }
    await storage.deleteAdvertisement(id);
    res.status(204).send();
  });

  // Advertiser Applications
  app.get("/api/advertiser-applications", isAdminVerified, async (req, res) => {
    const applications = await storage.getAdvertiserApplications();
    res.json(applications);
  });

  app.get("/api/advertiser-applications/:id", isAdminVerified, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    const app = await storage.getAdvertiserApplication(id);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(app);
  });

  app.post("/api/advertiser-applications", async (req, res) => {
    try {
      const input = insertAdvertiserApplicationSchema.parse(req.body);
      const app = await storage.createAdvertiserApplication(input);
      res.status(201).json(app);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/advertiser-applications/:id/status", isAdminVerified, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    const { status } = req.body;
    if (!status || !["pending", "approved", "rejected", "contacted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const app = await storage.updateAdvertiserApplicationStatus(id, status);
    res.json(app);
  });

  app.delete("/api/advertiser-applications/:id", isAdminVerified, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    await storage.deleteAdvertiserApplication(id);
    res.status(204).send();
  });

  // === Advertiser Portal ===
  
  // Advertiser login with email + PIN
  app.post("/api/verify-advertiser-pin", async (req: any, res) => {
    const { email, pin } = req.body;
    if (!email || !pin) {
      return res.status(400).json({ message: "Email and PIN are required" });
    }
    const advertiser = await storage.getAdvertiserByEmail(email);
    if (!advertiser || advertiser.pin !== pin) {
      return res.status(401).json({ message: "Invalid email or PIN" });
    }
    if (!advertiser.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });
    }
    req.session.advertiserId = advertiser.id;
    req.session.advertiserName = advertiser.companyName;
    res.json({ success: true, companyName: advertiser.companyName });
  });

  app.get("/api/advertiser-status", async (req: any, res) => {
    if (req.session?.advertiserId) {
      const advertiser = await storage.getAdvertiser(req.session.advertiserId);
      res.json({ 
        isAdvertiser: true, 
        advertiserId: req.session.advertiserId,
        companyName: advertiser?.companyName || req.session.advertiserName
      });
    } else {
      res.json({ isAdvertiser: false });
    }
  });

  app.post("/api/exit-advertiser-mode", async (req: any, res) => {
    req.session.advertiserId = null;
    req.session.advertiserName = null;
    res.json({ success: true });
  });

  // Admin manages advertisers
  app.get("/api/advertisers", isAdminVerified, async (req, res) => {
    const allAdvertisers = await storage.getAdvertisers();
    res.json(allAdvertisers);
  });

  app.post("/api/advertisers", isAdminVerified, async (req, res) => {
    try {
      const { companyName, contactName, email, phone, website, industry, pin } = req.body;
      if (!companyName || !contactName || !email || !pin) {
        return res.status(400).json({ message: "Company name, contact name, email, and PIN are required" });
      }
      const existing = await storage.getAdvertiserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An advertiser with this email already exists" });
      }
      const advertiser = await storage.createAdvertiser({ companyName, contactName, email, phone, website, industry, pin });
      res.status(201).json(advertiser);
    } catch (err) {
      res.status(500).json({ message: "Error creating advertiser" });
    }
  });

  app.patch("/api/advertisers/:id", isAdminVerified, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid advertiser ID" });
    }
    const updates = req.body;
    const advertiser = await storage.updateAdvertiser(id, updates);
    res.json(advertiser);
  });

  app.delete("/api/advertisers/:id", isAdminVerified, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid advertiser ID" });
    }
    await storage.deleteAdvertiser(id);
    res.status(204).send();
  });

  // Advertiser's own ads (protected by advertiser auth)
  app.get("/api/advertiser/my-ads", isAdvertiserVerified, async (req: any, res) => {
    const ads = await storage.getAdvertiserAds(req.session.advertiserId);
    res.json(ads);
  });

  app.post("/api/advertiser/my-ads", isAdvertiserVerified, async (req: any, res) => {
    try {
      const advertiser = await storage.getAdvertiser(req.session.advertiserId);
      if (!advertiser) {
        return res.status(404).json({ message: "Advertiser not found" });
      }
      const input = insertAdvertisementSchema.parse({
        ...req.body,
        advertiserId: req.session.advertiserId,
        sponsorName: advertiser.companyName
      });
      const ad = await storage.createAdvertisement(input);
      res.status(201).json(ad);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Error creating advertisement" });
    }
  });

  app.patch("/api/advertiser/my-ads/:id", isAdvertiserVerified, async (req: any, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid advertisement ID" });
    }
    // Verify the ad belongs to this advertiser
    const ad = await storage.getAdvertisement(id);
    if (!ad || ad.advertiserId !== req.session.advertiserId) {
      return res.status(403).json({ message: "You can only edit your own advertisements" });
    }
    const updates = req.body;
    delete updates.advertiserId; // Don't allow changing ownership
    const updatedAd = await storage.updateAdvertisement(id, updates);
    res.json(updatedAd);
  });

  // Route Analytics (public for advertisers to see traffic data)
  app.get("/api/route-analytics", async (req, res) => {
    const analytics = await storage.getLatestRouteAnalytics();
    res.json(analytics);
  });

  app.get("/api/route-analytics/:routeId", async (req, res) => {
    const routeId = Number(req.params.routeId);
    if (isNaN(routeId)) {
      return res.status(400).json({ message: "Invalid route ID" });
    }
    const analytics = await storage.getRouteAnalytics(routeId);
    res.json(analytics);
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

  // Seed sample advertiser if none exist
  const existingAdvertisers = await storage.getAdvertisers();
  if (existingAdvertisers.length === 0) {
    console.log("Seeding sample advertiser...");
    await storage.createAdvertiser({
      companyName: "Demo Advertising Co",
      contactName: "Jane Smith",
      email: "demo@advertiser.com",
      phone: "011-555-1234",
      website: "https://demo-advertiser.co.za",
      industry: "Retail",
      pin: "1234"
    });
    console.log("Sample advertiser created: demo@advertiser.com / PIN: 1234");
  }

  // Seed route analytics if none exist
  const existingAnalytics = await storage.getAllRouteAnalytics();
  if (existingAnalytics.length === 0) {
    const routes = await storage.getBusRoutes();
    if (routes.length > 0) {
      console.log("Seeding route analytics...");
      
      // Create analytics for last 7 days for each route
      for (const route of routes) {
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          await storage.createRouteAnalytics({
            routeId: route.id,
            date,
            dailyPassengers: Math.floor(Math.random() * 500) + 200,
            peakHourPassengers: Math.floor(Math.random() * 100) + 50,
            averageWaitTime: Math.floor(Math.random() * 15) + 5,
            impressions: Math.floor(Math.random() * 1000) + 500,
            clicks: Math.floor(Math.random() * 50) + 10
          });
        }
      }
      console.log("Route analytics seeded for " + routes.length + " routes.");
    }
  }
}
