import { db } from "./db";
import {
  busRoutes,
  notifications,
  subscriptions,
  users,
  reviews,
  messages,
  busPositions,
  provinces,
  municipalities,
  jobs,
  jobApplications,
  advertisements,
  advertiserApplications,
  advertisers,
  routeAnalytics,
  marketplaceVendors,
  marketplaceProducts,
  type BusRoute,
  type InsertBusRoute,
  type Notification,
  type InsertNotification,
  type Subscription,
  type CreateSubscriptionRequest,
  type User,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
  type BusPosition,
  type InsertBusPosition,
  type Province,
  type InsertProvince,
  type Municipality,
  type InsertMunicipality,
  type Job,
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type Advertisement,
  type InsertAdvertisement,
  type AdvertiserApplication,
  type InsertAdvertiserApplication,
  type Advertiser,
  type InsertAdvertiser,
  type RouteAnalytics,
  type InsertRouteAnalytics,
  type MarketplaceVendor,
  type InsertMarketplaceVendor,
  type MarketplaceProduct,
  type InsertMarketplaceProduct,
} from "@shared/schema";
import { eq, desc, and, or, gt, lte, isNull } from "drizzle-orm";

export interface IStorage {
  // Routes
  getBusRoutes(search?: string): Promise<BusRoute[]>;
  getBusRoute(id: number): Promise<BusRoute | undefined>;
  createBusRoute(route: InsertBusRoute): Promise<BusRoute>;
  updateBusRoute(id: number, updates: Partial<InsertBusRoute>): Promise<BusRoute>;
  deleteBusRoute(id: number): Promise<void>;

  // Notifications
  getNotifications(userId?: string): Promise<(Notification & { routeName?: string })[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;

  // Subscriptions
  getSubscriptions(userId: string): Promise<(Subscription & { route: BusRoute })[]>;
  createSubscription(userId: string, routeId: number): Promise<Subscription>;
  deleteSubscription(userId: string, routeId: number): Promise<void>;
  getRouteSubscriptions(routeId: number): Promise<Subscription[]>;

  // Reviews
  getRouteReviews(routeId: number): Promise<(Review & { user: User })[]>;
  getAllReviews(): Promise<(Review & { user: User; route: BusRoute })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Chat
  getRouteMessages(routeId: number): Promise<(Message & { user: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Bus Positions
  getBusPositions(routeId: number): Promise<BusPosition[]>;
  updateBusPosition(position: InsertBusPosition): Promise<BusPosition>;

  // User Preferences
  getUser(id: string): Promise<User | undefined>;
  updateUserPreferences(id: string, pinned: number[], hidden: number[]): Promise<User>;

  // Provinces & Municipalities
  getProvinces(): Promise<Province[]>;
  createProvince(province: InsertProvince): Promise<Province>;
  getMunicipalities(provinceId?: number): Promise<(Municipality & { province: Province })[]>;
  getMunicipality(id: number): Promise<Municipality | undefined>;
  createMunicipality(municipality: InsertMunicipality): Promise<Municipality>;

  // Jobs
  getJobs(activeOnly?: boolean): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;

  // Job Applications
  getJobApplications(jobId?: number): Promise<(JobApplication & { job: Job })[]>;
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  getJobApplicationsByEmail(email: string): Promise<(JobApplication & { job: Job })[]>;
  createJobApplication(app: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: number, updates: Partial<InsertJobApplication>): Promise<JobApplication>;
  deleteJobApplication(id: number): Promise<void>;

  // Advertisements
  getAdvertisements(activeOnly?: boolean): Promise<Advertisement[]>;
  getAdvertisement(id: number): Promise<Advertisement | undefined>;
  getActiveAdsForRoute(routeId: number): Promise<Advertisement[]>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: number, updates: Partial<InsertAdvertisement>): Promise<Advertisement>;
  deleteAdvertisement(id: number): Promise<void>;

  // Advertiser Applications
  getAdvertiserApplications(): Promise<AdvertiserApplication[]>;
  getAdvertiserApplication(id: number): Promise<AdvertiserApplication | undefined>;
  createAdvertiserApplication(app: InsertAdvertiserApplication): Promise<AdvertiserApplication>;
  updateAdvertiserApplicationStatus(id: number, status: string): Promise<AdvertiserApplication>;
  deleteAdvertiserApplication(id: number): Promise<void>;

  // Marketplace Vendors
  getMarketplaceVendors(approvedOnly?: boolean): Promise<MarketplaceVendor[]>;
  getMarketplaceVendor(id: number): Promise<MarketplaceVendor | undefined>;
  getMarketplaceVendorByEmail(email: string): Promise<MarketplaceVendor | undefined>;
  createMarketplaceVendor(vendor: InsertMarketplaceVendor): Promise<MarketplaceVendor>;
  updateMarketplaceVendor(id: number, updates: Partial<InsertMarketplaceVendor>): Promise<MarketplaceVendor>;
  approveMarketplaceVendor(id: number, approved: boolean): Promise<MarketplaceVendor>;
  deleteMarketplaceVendor(id: number): Promise<void>;

  // Marketplace Products
  getMarketplaceProducts(vendorId?: number, category?: string): Promise<(MarketplaceProduct & { vendor: MarketplaceVendor })[]>;
  getMarketplaceProduct(id: number): Promise<MarketplaceProduct | undefined>;
  createMarketplaceProduct(product: InsertMarketplaceProduct): Promise<MarketplaceProduct>;
  updateMarketplaceProduct(id: number, updates: Partial<InsertMarketplaceProduct>): Promise<MarketplaceProduct>;
  deleteMarketplaceProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserPreferences(id: string, pinned: number[], hidden: number[]): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ pinnedRoutes: pinned, hiddenRoutes: hidden })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Routes
  async getBusRoutes(search?: string): Promise<BusRoute[]> {
    const query = db.select().from(busRoutes);
    return await query.orderBy(busRoutes.name);
  }

  async getBusRoute(id: number): Promise<BusRoute | undefined> {
    const [route] = await db.select().from(busRoutes).where(eq(busRoutes.id, id));
    return route;
  }

  async createBusRoute(route: InsertBusRoute): Promise<BusRoute> {
    const [newRoute] = await db.insert(busRoutes).values(route).returning();
    return newRoute;
  }

  async updateBusRoute(id: number, updates: Partial<InsertBusRoute>): Promise<BusRoute> {
    const [updated] = await db
      .update(busRoutes)
      .set(updates)
      .where(eq(busRoutes.id, id))
      .returning();
    return updated;
  }

  async deleteBusRoute(id: number): Promise<void> {
    await db.delete(busRoutes).where(eq(busRoutes.id, id));
  }

  // Notifications
  async getNotifications(userId?: string): Promise<(Notification & { routeName?: string })[]> {
    const results = await db
      .select({
        notification: notifications,
        routeName: busRoutes.name,
      })
      .from(notifications)
      .leftJoin(busRoutes, eq(notifications.routeId, busRoutes.id))
      .orderBy(desc(notifications.createdAt));
    
    return results.map(r => ({
      ...r.notification,
      routeName: r.routeName || undefined
    }));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotif] = await db.insert(notifications).values(notification).returning();
    return newNotif;
  }

  // Subscriptions
  async getSubscriptions(userId: string): Promise<(Subscription & { route: BusRoute })[]> {
    const results = await db
      .select({
        subscription: subscriptions,
        route: busRoutes,
      })
      .from(subscriptions)
      .innerJoin(busRoutes, eq(subscriptions.routeId, busRoutes.id))
      .where(eq(subscriptions.userId, userId));
    
    return results.map(r => ({
      ...r.subscription,
      route: r.route,
    }));
  }

  async createSubscription(userId: string, routeId: number): Promise<Subscription> {
    const [sub] = await db
      .insert(subscriptions)
      .values({ userId, routeId })
      .returning();
    return sub;
  }

  async deleteSubscription(userId: string, routeId: number): Promise<void> {
    await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.routeId, routeId)));
  }

  async getRouteSubscriptions(routeId: number): Promise<Subscription[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.routeId, routeId));
  }

  // Reviews
  async getRouteReviews(routeId: number): Promise<(Review & { user: User })[]> {
    const results = await db
      .select({
        review: reviews,
        user: users,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.routeId, routeId))
      .orderBy(desc(reviews.createdAt));
    
    return results.map(r => ({
      ...r.review,
      user: r.user,
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getAllReviews(): Promise<(Review & { user: User; route: BusRoute })[]> {
    const results = await db
      .select({
        review: reviews,
        user: users,
        route: busRoutes,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(busRoutes, eq(reviews.routeId, busRoutes.id))
      .orderBy(desc(reviews.createdAt));
    
    return results.map(r => ({
      ...r.review,
      user: r.user,
      route: r.route,
    }));
  }

  // Chat
  async getRouteMessages(routeId: number): Promise<(Message & { user: User })[]> {
    const results = await db
      .select({
        message: messages,
        user: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.routeId, routeId))
      .orderBy(desc(messages.createdAt));

    return results.map(r => ({
      ...r.message,
      user: r.user,
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Bus Positions
  async getBusPositions(routeId: number): Promise<BusPosition[]> {
    return await db.select().from(busPositions).where(eq(busPositions.routeId, routeId));
  }

  async updateBusPosition(position: InsertBusPosition): Promise<BusPosition> {
    const [updated] = await db
      .insert(busPositions)
      .values(position)
      .onConflictDoUpdate({
        target: busPositions.busId,
        set: {
          lat: position.lat,
          lng: position.lng,
          speed: position.speed,
          bearing: position.bearing,
          lastUpdate: new Date(),
        },
      })
      .returning();
    return updated;
  }

  // Provinces
  async getProvinces(): Promise<Province[]> {
    return await db.select().from(provinces).orderBy(provinces.name);
  }

  async createProvince(province: InsertProvince): Promise<Province> {
    const [newProvince] = await db.insert(provinces).values(province).returning();
    return newProvince;
  }

  // Municipalities
  async getMunicipalities(provinceId?: number): Promise<(Municipality & { province: Province })[]> {
    const query = db
      .select({
        municipality: municipalities,
        province: provinces,
      })
      .from(municipalities)
      .innerJoin(provinces, eq(municipalities.provinceId, provinces.id))
      .orderBy(municipalities.name);

    if (provinceId) {
      const results = await query.where(eq(municipalities.provinceId, provinceId));
      return results.map(r => ({ ...r.municipality, province: r.province }));
    }
    
    const results = await query;
    return results.map(r => ({ ...r.municipality, province: r.province }));
  }

  async getMunicipality(id: number): Promise<Municipality | undefined> {
    const [municipality] = await db.select().from(municipalities).where(eq(municipalities.id, id));
    return municipality;
  }

  async createMunicipality(municipality: InsertMunicipality): Promise<Municipality> {
    const [newMunicipality] = await db.insert(municipalities).values(municipality).returning();
    return newMunicipality;
  }

  // Jobs
  async getJobs(activeOnly: boolean = true): Promise<Job[]> {
    if (activeOnly) {
      const now = new Date();
      return await db.select().from(jobs).where(
        and(
          eq(jobs.isActive, true),
          or(
            isNull(jobs.expiryDate),
            gt(jobs.expiryDate, now)
          )
        )
      ).orderBy(desc(jobs.createdAt));
    }
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: number, updates: Partial<InsertJob>): Promise<Job> {
    const [updated] = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Job Applications
  async getJobApplications(jobId?: number): Promise<(JobApplication & { job: Job })[]> {
    const query = db
      .select({
        application: jobApplications,
        job: jobs,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .orderBy(desc(jobApplications.createdAt));
    
    if (jobId) {
      const results = await query.where(eq(jobApplications.jobId, jobId));
      return results.map(r => ({ ...r.application, job: r.job }));
    }
    
    const results = await query;
    return results.map(r => ({ ...r.application, job: r.job }));
  }

  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    const [app] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return app;
  }

  async getJobApplicationsByEmail(email: string): Promise<(JobApplication & { job: Job })[]> {
    const results = await db
      .select({
        application: jobApplications,
        job: jobs,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(eq(jobApplications.email, email))
      .orderBy(desc(jobApplications.createdAt));
    
    return results.map(r => ({ ...r.application, job: r.job }));
  }

  async createJobApplication(app: InsertJobApplication): Promise<JobApplication> {
    const [newApp] = await db.insert(jobApplications).values(app).returning();
    return newApp;
  }

  async updateJobApplication(id: number, updates: Partial<InsertJobApplication>): Promise<JobApplication> {
    const [updated] = await db.update(jobApplications).set({ ...updates, updatedAt: new Date() }).where(eq(jobApplications.id, id)).returning();
    return updated;
  }

  async deleteJobApplication(id: number): Promise<void> {
    await db.delete(jobApplications).where(eq(jobApplications.id, id));
  }

  // Advertisements
  async getAdvertisements(activeOnly: boolean = true): Promise<Advertisement[]> {
    if (activeOnly) {
      const now = new Date();
      return await db.select().from(advertisements).where(
        and(
          eq(advertisements.isActive, true),
          eq(advertisements.approvalStatus, "approved"),
          lte(advertisements.startDate, now),
          gt(advertisements.endDate, now)
        )
      ).orderBy(desc(advertisements.createdAt));
    }
    return await db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
  }

  async getAdvertisement(id: number): Promise<Advertisement | undefined> {
    const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, id));
    return ad;
  }

  async getActiveAdsForRoute(routeId: number): Promise<Advertisement[]> {
    const now = new Date();
    const allActiveAds = await db.select().from(advertisements).where(
      and(
        eq(advertisements.isActive, true),
        eq(advertisements.approvalStatus, "approved"), // Only show approved ads
        lte(advertisements.startDate, now),
        gt(advertisements.endDate, now)
      )
    );
    
    // Filter ads that apply to this route (routeIds is null = all routes, or contains this routeId)
    return allActiveAds.filter(ad => 
      !ad.routeIds || ad.routeIds.length === 0 || ad.routeIds.includes(routeId)
    );
  }

  async getPendingAds(): Promise<Advertisement[]> {
    return await db.select().from(advertisements)
      .where(eq(advertisements.approvalStatus, "pending"))
      .orderBy(desc(advertisements.createdAt));
  }

  async getAllAdsForAdmin(): Promise<Advertisement[]> {
    return await db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
  }

  async approveAdvertisement(id: number, reason?: string): Promise<Advertisement> {
    const [updated] = await db.update(advertisements).set({ 
      approvalStatus: "approved",
      approvalReason: reason || null,
      reviewedAt: new Date()
    }).where(eq(advertisements.id, id)).returning();
    return updated;
  }

  async rejectAdvertisement(id: number, reason: string): Promise<Advertisement> {
    const [updated] = await db.update(advertisements).set({ 
      approvalStatus: "rejected",
      approvalReason: reason,
      reviewedAt: new Date()
    }).where(eq(advertisements.id, id)).returning();
    return updated;
  }

  async createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement> {
    const [newAd] = await db.insert(advertisements).values(ad).returning();
    return newAd;
  }

  async updateAdvertisement(id: number, updates: Partial<InsertAdvertisement>): Promise<Advertisement> {
    const [updated] = await db.update(advertisements).set(updates).where(eq(advertisements.id, id)).returning();
    return updated;
  }

  async deleteAdvertisement(id: number): Promise<void> {
    await db.delete(advertisements).where(eq(advertisements.id, id));
  }

  // Advertiser Applications
  async getAdvertiserApplications(): Promise<AdvertiserApplication[]> {
    return await db.select().from(advertiserApplications).orderBy(desc(advertiserApplications.createdAt));
  }

  async getAdvertiserApplication(id: number): Promise<AdvertiserApplication | undefined> {
    const [app] = await db.select().from(advertiserApplications).where(eq(advertiserApplications.id, id));
    return app;
  }

  async createAdvertiserApplication(app: InsertAdvertiserApplication): Promise<AdvertiserApplication> {
    const [newApp] = await db.insert(advertiserApplications).values(app).returning();
    return newApp;
  }

  async updateAdvertiserApplicationStatus(id: number, status: string): Promise<AdvertiserApplication> {
    const [updated] = await db.update(advertiserApplications).set({ status }).where(eq(advertiserApplications.id, id)).returning();
    return updated;
  }

  async deleteAdvertiserApplication(id: number): Promise<void> {
    await db.delete(advertiserApplications).where(eq(advertiserApplications.id, id));
  }

  // Advertisers
  async getAdvertisers(): Promise<Advertiser[]> {
    return await db.select().from(advertisers).orderBy(desc(advertisers.createdAt));
  }

  async getAdvertiser(id: number): Promise<Advertiser | undefined> {
    const [advertiser] = await db.select().from(advertisers).where(eq(advertisers.id, id));
    return advertiser;
  }

  async getAdvertiserByEmail(email: string): Promise<Advertiser | undefined> {
    const [advertiser] = await db.select().from(advertisers).where(eq(advertisers.email, email));
    return advertiser;
  }

  async createAdvertiser(advertiser: InsertAdvertiser): Promise<Advertiser> {
    const [newAdvertiser] = await db.insert(advertisers).values(advertiser).returning();
    return newAdvertiser;
  }

  async updateAdvertiser(id: number, updates: Partial<InsertAdvertiser>): Promise<Advertiser> {
    const [updated] = await db.update(advertisers).set(updates).where(eq(advertisers.id, id)).returning();
    return updated;
  }

  async deleteAdvertiser(id: number): Promise<void> {
    await db.delete(advertisers).where(eq(advertisers.id, id));
  }

  async getAdvertiserAds(advertiserId: number): Promise<Advertisement[]> {
    return await db.select().from(advertisements).where(eq(advertisements.advertiserId, advertiserId)).orderBy(desc(advertisements.createdAt));
  }

  // Route Analytics
  async getRouteAnalytics(routeId: number): Promise<RouteAnalytics[]> {
    return await db.select().from(routeAnalytics).where(eq(routeAnalytics.routeId, routeId)).orderBy(desc(routeAnalytics.date));
  }

  async getAllRouteAnalytics(): Promise<RouteAnalytics[]> {
    return await db.select().from(routeAnalytics).orderBy(desc(routeAnalytics.date));
  }

  async createRouteAnalytics(analytics: InsertRouteAnalytics): Promise<RouteAnalytics> {
    const [newAnalytics] = await db.insert(routeAnalytics).values(analytics).returning();
    return newAnalytics;
  }

  async getLatestRouteAnalytics(): Promise<(RouteAnalytics & { routeName: string })[]> {
    const routes = await this.getBusRoutes();
    const allAnalytics = await this.getAllRouteAnalytics();
    
    const latestByRoute = new Map<number, RouteAnalytics>();
    for (const a of allAnalytics) {
      if (!latestByRoute.has(a.routeId)) {
        latestByRoute.set(a.routeId, a);
      }
    }
    
    return Array.from(latestByRoute.values()).map(a => ({
      ...a,
      routeName: routes.find(r => r.id === a.routeId)?.name || 'Unknown Route'
    }));
  }

  // Marketplace Vendors
  async getMarketplaceVendors(approvedOnly: boolean = false): Promise<MarketplaceVendor[]> {
    if (approvedOnly) {
      return await db.select().from(marketplaceVendors)
        .where(and(eq(marketplaceVendors.isApproved, true), eq(marketplaceVendors.isActive, true)))
        .orderBy(marketplaceVendors.businessName);
    }
    return await db.select().from(marketplaceVendors).orderBy(marketplaceVendors.businessName);
  }

  async getMarketplaceVendor(id: number): Promise<MarketplaceVendor | undefined> {
    const [vendor] = await db.select().from(marketplaceVendors).where(eq(marketplaceVendors.id, id));
    return vendor;
  }

  async getMarketplaceVendorByEmail(email: string): Promise<MarketplaceVendor | undefined> {
    const [vendor] = await db.select().from(marketplaceVendors).where(eq(marketplaceVendors.email, email));
    return vendor;
  }

  async createMarketplaceVendor(vendor: InsertMarketplaceVendor): Promise<MarketplaceVendor> {
    const [newVendor] = await db.insert(marketplaceVendors).values(vendor).returning();
    return newVendor;
  }

  async updateMarketplaceVendor(id: number, updates: Partial<InsertMarketplaceVendor>): Promise<MarketplaceVendor> {
    const [updated] = await db.update(marketplaceVendors).set(updates).where(eq(marketplaceVendors.id, id)).returning();
    return updated;
  }

  async approveMarketplaceVendor(id: number, approved: boolean): Promise<MarketplaceVendor> {
    const [updated] = await db.update(marketplaceVendors).set({ isApproved: approved }).where(eq(marketplaceVendors.id, id)).returning();
    return updated;
  }

  async deleteMarketplaceVendor(id: number): Promise<void> {
    await db.delete(marketplaceProducts).where(eq(marketplaceProducts.vendorId, id));
    await db.delete(marketplaceVendors).where(eq(marketplaceVendors.id, id));
  }

  // Marketplace Products
  async getMarketplaceProducts(vendorId?: number, category?: string): Promise<(MarketplaceProduct & { vendor: MarketplaceVendor })[]> {
    let results;
    if (vendorId) {
      results = await db.select({
        product: marketplaceProducts,
        vendor: marketplaceVendors,
      }).from(marketplaceProducts)
        .innerJoin(marketplaceVendors, eq(marketplaceProducts.vendorId, marketplaceVendors.id))
        .where(eq(marketplaceProducts.vendorId, vendorId))
        .orderBy(marketplaceProducts.name);
    } else {
      results = await db.select({
        product: marketplaceProducts,
        vendor: marketplaceVendors,
      }).from(marketplaceProducts)
        .innerJoin(marketplaceVendors, eq(marketplaceProducts.vendorId, marketplaceVendors.id))
        .where(and(eq(marketplaceVendors.isApproved, true), eq(marketplaceProducts.isAvailable, true)))
        .orderBy(marketplaceProducts.name);
    }
    
    let filtered = results.map(r => ({ ...r.product, vendor: r.vendor }));
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    return filtered;
  }

  async getMarketplaceProduct(id: number): Promise<MarketplaceProduct | undefined> {
    const [product] = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.id, id));
    return product;
  }

  async createMarketplaceProduct(product: InsertMarketplaceProduct): Promise<MarketplaceProduct> {
    const [newProduct] = await db.insert(marketplaceProducts).values(product).returning();
    return newProduct;
  }

  async updateMarketplaceProduct(id: number, updates: Partial<InsertMarketplaceProduct>): Promise<MarketplaceProduct> {
    const [updated] = await db.update(marketplaceProducts).set(updates).where(eq(marketplaceProducts.id, id)).returning();
    return updated;
  }

  async deleteMarketplaceProduct(id: number): Promise<void> {
    await db.delete(marketplaceProducts).where(eq(marketplaceProducts.id, id));
  }
}

export const storage = new DatabaseStorage();
