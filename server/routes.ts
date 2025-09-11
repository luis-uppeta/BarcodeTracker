import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScanRecordSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to create a scan record
  app.post("/api/scan-records", async (req, res) => {
    try {
      const validatedData = insertScanRecordSchema.parse(req.body);
      
      // Validate UID format (English letter + 3 digits)
      const uidPattern = /^[A-Za-z]\d{3}$/;
      if (!uidPattern.test(validatedData.uid)) {
        return res.status(400).json({ 
          message: "Invalid UID format. Must be English letter followed by 3 digits." 
        });
      }

      // Capture client IP address
      const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
      const recordWithIp = {
        ...validatedData,
        ipAddress: clientIp
      };

      const record = await storage.createScanRecord(recordWithIp);
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // API route to get scan history with optional filtering
  app.get("/api/scan-records", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const filterType = req.query.filter as string;
      const sandbox = req.query.sandbox as string;
      
      let records;
      
      if (filterType === 'my-scans') {
        // Get records for current IP
        const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
        records = await storage.getScanRecordsByIp(clientIp, limit);
      } else if (filterType === 'sandbox' && sandbox) {
        // Get records for specific sandbox
        records = await storage.getScanRecordsBySandbox(sandbox, limit);
      } else {
        // Get all records
        records = await storage.getScanRecordsByTimeRange(limit);
      }
      
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // API route to get client information
  app.get("/api/client-info", async (req, res) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
      res.json({ 
        ip: clientIp,
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
