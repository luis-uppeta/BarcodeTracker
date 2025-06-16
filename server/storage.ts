import { users, scanRecords, type User, type InsertUser, type ScanRecord, type InsertScanRecord } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScanRecord(record: InsertScanRecord): Promise<ScanRecord>;
  getScanRecords(): Promise<ScanRecord[]>;
  getScanRecordsByTimeRange(limit?: number): Promise<ScanRecord[]>;
  getScanRecordsByIp(ipAddress: string, limit?: number): Promise<ScanRecord[]>;
  getScanRecordsBySandbox(sandbox: string, limit?: number): Promise<ScanRecord[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createScanRecord(insertRecord: InsertScanRecord): Promise<ScanRecord> {
    const [record] = await db
      .insert(scanRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async getScanRecords(): Promise<ScanRecord[]> {
    return await db
      .select()
      .from(scanRecords)
      .orderBy(desc(scanRecords.timestamp));
  }

  async getScanRecordsByTimeRange(limit = 50): Promise<ScanRecord[]> {
    return await db
      .select()
      .from(scanRecords)
      .orderBy(desc(scanRecords.timestamp))
      .limit(limit);
  }

  async getScanRecordsByIp(ipAddress: string, limit = 50): Promise<ScanRecord[]> {
    return await db
      .select()
      .from(scanRecords)
      .where(eq(scanRecords.ipAddress, ipAddress))
      .orderBy(desc(scanRecords.timestamp))
      .limit(limit);
  }

  async getScanRecordsBySandbox(sandbox: string, limit = 50): Promise<ScanRecord[]> {
    return await db
      .select()
      .from(scanRecords)
      .where(eq(scanRecords.sandbox, sandbox))
      .orderBy(desc(scanRecords.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
