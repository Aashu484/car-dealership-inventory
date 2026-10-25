import { Router } from "express";
import Database from "better-sqlite3";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { Vehicle } from "../types";

const createSchema = z.object({
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  category: z.string().trim().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
});

const updateSchema = createSchema.partial();
const restockSchema = z.object({
  quantity: z.number().int().positive(),
});

function mapVehicle(row: Vehicle): Vehicle {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    category: row.category,
    price: row.price,
    quantity: row.quantity,
  };
}

export function createVehicleRouter(db: Database.Database, jwtSecret: string) {
  const router = Router();
  router.use(requireAuth(jwtSecret));

  router.get("/", (_req, res) => {
    const rows = db
      .prepare("SELECT id, make, model, category, price, quantity FROM vehicles ORDER BY id")
      .all() as Vehicle[];
    return res.json(rows.map(mapVehicle));
  });

  router.get("/search", (req, res) => {
    const make = String(req.query.make ?? "").trim();
    const model = String(req.query.model ?? "").trim();
    const category = String(req.query.category ?? "").trim();
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;

    const clauses: string[] = [];
    const params: Array<string | number> = [];

    if (make) {
      clauses.push("LOWER(make) LIKE ?");
      params.push(`%${make.toLowerCase()}%`);
    }
    if (model) {
      clauses.push("LOWER(model) LIKE ?");
      params.push(`%${model.toLowerCase()}%`);
    }
    if (category) {
      clauses.push("LOWER(category) = ?");
      params.push(category.toLowerCase());
    }
    if (minPrice !== undefined && !Number.isNaN(minPrice)) {
      clauses.push("price >= ?");
      params.push(minPrice);
    }
    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      clauses.push("price <= ?");
      params.push(maxPrice);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT id, make, model, category, price, quantity FROM vehicles ${where} ORDER BY id`,
      )
      .all(...params) as Vehicle[];
    return res.json(rows.map(mapVehicle));
  });

  router.post("/", (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid vehicle payload" });
    }

    const { make, model, category, price, quantity } = parsed.data;
    const result = db
      .prepare(
        "INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)",
      )
      .run(make, model, category, price, quantity);

    return res.status(201).json({
      id: Number(result.lastInsertRowid),
      make,
      model,
      category,
      price,
      quantity,
    });
  });

  router.put("/:id", (req, res) => {
    const id = Number(req.params.id);
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ error: "Invalid vehicle update" });
    }

    const existing = db
      .prepare("SELECT id, make, model, category, price, quantity FROM vehicles WHERE id = ?")
      .get(id) as Vehicle | undefined;
    if (!existing) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const next = { ...existing, ...parsed.data };
    db.prepare(
      "UPDATE vehicles SET make = ?, model = ?, category = ?, price = ?, quantity = ? WHERE id = ?",
    ).run(next.make, next.model, next.category, next.price, next.quantity, id);

    return res.json(next);
  });

  router.delete("/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const result = db.prepare("DELETE FROM vehicles WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    return res.status(204).send();
  });

  router.post("/:id/purchase", (req, res) => {
    const id = Number(req.params.id);
    const purchase = db.transaction(() => {
      const vehicle = db
        .prepare("SELECT id, make, model, category, price, quantity FROM vehicles WHERE id = ?")
        .get(id) as Vehicle | undefined;
      if (!vehicle) {
        return { status: 404 as const, body: { error: "Vehicle not found" } };
      }
      if (vehicle.quantity < 1) {
        return { status: 409 as const, body: { error: "Vehicle is out of stock" } };
      }
      const quantity = vehicle.quantity - 1;
      db.prepare("UPDATE vehicles SET quantity = ? WHERE id = ?").run(quantity, id);
      return { status: 200 as const, body: { ...vehicle, quantity } };
    });

    const result = purchase();
    return res.status(result.status).json(result.body);
  });

  router.post("/:id/restock", requireAdmin, (req, res) => {
    const parsed = restockSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Restock quantity must be a positive integer" });
    }

    const id = Number(req.params.id);
    const vehicle = db
      .prepare("SELECT id, make, model, category, price, quantity FROM vehicles WHERE id = ?")
      .get(id) as Vehicle | undefined;
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const quantity = vehicle.quantity + parsed.data.quantity;
    db.prepare("UPDATE vehicles SET quantity = ? WHERE id = ?").run(quantity, id);
    return res.json({ ...vehicle, quantity });
  });

  return router;
}
