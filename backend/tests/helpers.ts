import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import request from "supertest";
import { createApp } from "../src/app";
import { createDb } from "../src/db";

export type TestContext = {
  app: ReturnType<typeof createApp>;
  db: Database.Database;
  dir: string;
};

export function createTestContext(): TestContext {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dealership-"));
  const db = createDb(path.join(dir, "test.db"));
  const app = createApp(db, { jwtSecret: "test-secret" });
  return { app, db, dir };
}

export function cleanupTestContext(ctx: TestContext) {
  ctx.db.close();
  fs.rmSync(ctx.dir, { recursive: true, force: true });
}

export async function registerUser(
  app: TestContext["app"],
  overrides: { email?: string; password?: string; name?: string } = {},
) {
  const body = {
    name: "Test Buyer",
    email: "buyer@example.com",
    password: "Password123",
    ...overrides,
  };
  const res = await request(app).post("/api/auth/register").send(body);
  return { res, body };
}

export function promoteToAdmin(db: Database.Database, email: string) {
  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
}
