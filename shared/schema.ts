import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const scanRecords = pgTable("scan_records", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull(),
  sandbox: text("sandbox").notNull(),
  deviceInfo: text("device_info"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  success: boolean("success").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertScanRecordSchema = createInsertSchema(scanRecords).pick({
  uid: true,
  sandbox: true,
  deviceInfo: true,
  userAgent: true,
  ipAddress: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertScanRecord = z.infer<typeof insertScanRecordSchema>;
export type ScanRecord = typeof scanRecords.$inferSelect;
