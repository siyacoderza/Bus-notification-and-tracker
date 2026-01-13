import { z } from 'zod';
import { insertBusRouteSchema, insertNotificationSchema, busRoutes, notifications, subscriptions } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  routes: {
    list: {
      method: 'GET' as const,
      path: '/api/routes',
      input: z.object({
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof busRoutes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/routes/:id',
      responses: {
        200: z.custom<typeof busRoutes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Admin only
    create: {
      method: 'POST' as const,
      path: '/api/routes',
      input: insertBusRouteSchema,
      responses: {
        201: z.custom<typeof busRoutes.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/routes/:id',
      input: insertBusRouteSchema.partial(),
      responses: {
        200: z.custom<typeof busRoutes.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/routes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  notifications: {
    list: {
      method: 'GET' as const,
      path: '/api/notifications', // Returns active notifications, optionally filtered by my subscriptions
      input: z.object({
        onlyMyRoutes: z.coerce.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof notifications.$inferSelect & { routeName?: string }>()),
      },
    },
    // Admin only
    create: {
      method: 'POST' as const,
      path: '/api/notifications',
      input: insertNotificationSchema,
      responses: {
        201: z.custom<typeof notifications.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  subscriptions: {
    list: {
      method: 'GET' as const,
      path: '/api/subscriptions',
      responses: {
        200: z.array(z.custom<typeof subscriptions.$inferSelect & { route: typeof busRoutes.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/subscriptions',
      input: z.object({ routeId: z.number() }),
      responses: {
        201: z.custom<typeof subscriptions.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/subscriptions/:routeId', // Unsubscribe by route ID
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
