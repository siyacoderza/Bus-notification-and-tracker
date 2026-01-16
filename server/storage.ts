import { db } from "./db";
import {
  busRoutes,
  notifications,
  subscriptions,
  type BusRoute,
  type InsertBusRoute,
  type Notification,
  type InsertNotification,
  type Subscription,
  type CreateSubscriptionRequest,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

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
  // User Preferences
  getUser(id: string): Promise<User | undefined>;
  updateUserPreferences(id: string, pinned: number[], hidden: number[]): Promise<User>;
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
    // Basic search implementation
    const query = db.select().from(busRoutes);
    // In a real app, add where clause for search
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
    // If userId provided, could filter by subscriptions. For now, return all active.
    // Joining with routes to get names
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
}

export const storage = new DatabaseStorage();
