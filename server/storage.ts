import { users, scanRecords, type User, type InsertUser, type ScanRecord, type InsertScanRecord } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScanRecord(record: InsertScanRecord): Promise<ScanRecord>;
  getScanRecords(): Promise<ScanRecord[]>;
  getScanRecordsByTimeRange(limit?: number): Promise<ScanRecord[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scanRecords: Map<number, ScanRecord>;
  private currentUserId: number;
  private currentScanId: number;

  constructor() {
    this.users = new Map();
    this.scanRecords = new Map();
    this.currentUserId = 1;
    this.currentScanId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScanRecord(insertRecord: InsertScanRecord): Promise<ScanRecord> {
    const id = this.currentScanId++;
    const record: ScanRecord = {
      ...insertRecord,
      id,
      timestamp: new Date(),
      success: true,
    };
    this.scanRecords.set(id, record);
    return record;
  }

  async getScanRecords(): Promise<ScanRecord[]> {
    return Array.from(this.scanRecords.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getScanRecordsByTimeRange(limit = 50): Promise<ScanRecord[]> {
    const records = await this.getScanRecords();
    return records.slice(0, limit);
  }
}

export const storage = new MemStorage();
