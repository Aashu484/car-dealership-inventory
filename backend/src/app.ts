import cors from "cors";
import express from "express";
import Database from "better-sqlite3";
import { createAuthRouter } from "./routes/auth";
import { createVehicleRouter } from "./routes/vehicles";
import { AppConfig } from "./types";

export function createApp(db: Database.Database, config: AppConfig) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", createAuthRouter(db, config.jwtSecret));
  app.use("/api/vehicles", createVehicleRouter(db, config.jwtSecret));

  return app;
}
