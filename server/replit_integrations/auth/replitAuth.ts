import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import { Strategy as CustomStrategy } from "passport-custom";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import { users, otpStore } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../../db";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use("otp", new CustomStrategy(async (req: any, done: any) => {
    const { phoneNumber, code } = req.body;
    
    try {
      // 1. Verify OTP
      const [otp] = await db.select()
        .from(otpStore)
        .where(and(
          eq(otpStore.phoneNumber, phoneNumber),
          eq(otpStore.code, code),
          gt(otpStore.expiresAt, new Date())
        ));

      if (!otp) {
        return done(null, false, { message: "Invalid or expired OTP" });
      }

      // 2. Clear OTP
      await db.delete(otpStore).where(eq(otpStore.id, otp.id));

      // 3. Find or Create User
      let [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
      if (!user) {
        [user] = await db.insert(users).values({
          phoneNumber,
          firstName: phoneNumber, // Cellphone number as default username
          role: "passenger"
        }).returning();
      }

      return done(null, { id: user.id, phoneNumber: user.phoneNumber });
    } catch (err) {
      return done(err);
    }
  }));

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const claims = tokens.claims();
    if (!claims) return verified(new Error("No claims found"));
    
    const adminEmails = ["admin@mzansimove.co.za"];
    const role = adminEmails.includes(claims.email as string) ? "admin" : "passenger";

    await authStorage.upsertUser({
      id: claims.sub,
      email: claims.email as string,
      firstName: claims.first_name as string,
      lastName: claims.last_name as string,
      profileImageUrl: claims.profile_image_url as string,
      role: role,
    });

    verified(null, { 
      id: claims.sub, 
      claims,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: claims.exp
    });
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.post("/api/auth/otp/login", (req, res, next) => {
    passport.authenticate("otp", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({ message: "Logged in successfully", user });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
