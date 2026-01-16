export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const busRoutes = pgTable("bus_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Route 5: City Center to Sandton"
  description: text("description").notNull(),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  operatingCompany: text("operating_company").notNull(), // e.g., "Putco", "Rea Vaya"
  isActive: boolean("is_active").default(true),
  waitingCount: integer("waiting_count").default(0),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => busRoutes.id), // Nullable for general system alerts
  type: text("type").notNull(), // 'delay', 'cancellation', 'info', 'emergency'
  message: text("message").notNull(),
  activeUntil: timestamp("active_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  routeId: integer("route_id").notNull().references(() => busRoutes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull().references(() => busRoutes.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const busRoutesRelations = relations(busRoutes, ({ many }) => ({
  notifications: many(notifications),
  subscriptions: many(subscriptions),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  route: one(busRoutes, {
    fields: [reviews.routeId],
    references: [busRoutes.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  route: one(busRoutes, {
    fields: [notifications.routeId],
    references: [busRoutes.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  route: one(busRoutes, {
    fields: [subscriptions.routeId],
    references: [busRoutes.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

// === BASE SCHEMAS ===

export const insertBusRouteSchema = createInsertSchema(busRoutes).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type BusRoute = typeof busRoutes.$inferSelect;
export type InsertBusRoute = z.infer<typeof insertBusRouteSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Request types
export type CreateBusRouteRequest = InsertBusRoute;
export type UpdateBusRouteRequest = Partial<InsertBusRoute>;

export type CreateNotificationRequest = InsertNotification;

export type CreateSubscriptionRequest = { routeId: number }; // User ID comes from session

// Response types
export type BusRouteResponse = BusRoute;
export type NotificationResponse = Notification & { routeName?: string };
export type SubscriptionResponse = Subscription;
