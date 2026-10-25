import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createApp } from "./app";
import { createDb } from "./db";
import { seedIfEmpty } from "./seed";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? "dev-dealership-secret";
const dbPath = process.env.DATABASE_PATH ?? path.join(__dirname, "..", "data", "dealership.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = createDb(dbPath);
seedIfEmpty(db);

const app = createApp(db, { jwtSecret });

app.listen(port, () => {
  console.log(`Dealership API listening on http://localhost:${port}`);
});
