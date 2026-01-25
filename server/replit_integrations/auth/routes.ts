import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { db } from "../../db";
import { otpStore } from "@shared/schema";
import { eq } from "drizzle-orm";
import twilio from "twilio";

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/otp/send", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number required" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    try {
      await db.insert(otpStore).values({ phoneNumber, code, expiresAt });
      
      if (twilioClient) {
        await twilioClient.messages.create({
          body: `Your MzansiMove login code is: ${code}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
      } else {
        console.log(`[DEV MODE] OTP for ${phoneNumber}: ${code}`);
      }

      res.json({ message: "OTP sent successfully" });
    } catch (err) {
      console.error("Failed to send OTP:", err);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });
}
