import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import { z } from "zod";
import { AuthUser } from "../types";

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function publicUser(row: {
  id: number;
  name: string;
  email: string;
  role: AuthUser["role"];
}): AuthUser {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

function signToken(user: AuthUser, jwtSecret: string) {
  return jwt.sign(user, jwtSecret, { expiresIn: "12h" });
}

export function createAuthRouter(db: Database.Database, jwtSecret: string) {
  const router = Router();

  router.post("/register", (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid registration payload" });
    }

    const { name, email, password } = parsed.data;
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
      )
      .run(name, email, passwordHash);

    const user = publicUser({
      id: Number(result.lastInsertRowid),
      name,
      email,
      role: "user",
    });
    return res.status(201).json({ token: signToken(user, jwtSecret), user });
  });

  router.post("/login", (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid login payload" });
    }

    const row = db
      .prepare(
        "SELECT id, name, email, role, password_hash FROM users WHERE email = ?",
      )
      .get(parsed.data.email) as
      | {
          id: number;
          name: string;
          email: string;
          role: AuthUser["role"];
          password_hash: string;
        }
      | undefined;

    if (!row || !bcrypt.compareSync(parsed.data.password, row.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = publicUser(row);
    return res.status(200).json({ token: signToken(user, jwtSecret), user });
  });

  return router;
}
