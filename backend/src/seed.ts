import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const DEMO_VEHICLES = [
  { make: "Toyota", model: "Camry", category: "Sedan", price: 24999, quantity: 4 },
  { make: "Honda", model: "CR-V", category: "SUV", price: 32990, quantity: 2 },
  { make: "Tesla", model: "Model 3", category: "Electric", price: 39990, quantity: 1 },
  { make: "Ford", model: "F-150", category: "Truck", price: 45500, quantity: 0 },
  { make: "BMW", model: "3 Series", category: "Sedan", price: 42900, quantity: 3 },
];

export function seedIfEmpty(db: Database.Database) {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get() as {
    count: number;
  };
  if (userCount.count === 0) {
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ).run(
      "Dealership Admin",
      "admin@dealership.local",
      bcrypt.hashSync("Admin123!", 10),
      "admin",
    );
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ).run(
      "Alex Buyer",
      "buyer@dealership.local",
      bcrypt.hashSync("Buyer123!", 10),
      "user",
    );
  }

  const vehicleCount = db.prepare("SELECT COUNT(*) AS count FROM vehicles").get() as {
    count: number;
  };
  if (vehicleCount.count === 0) {
    const insert = db.prepare(
      "INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)",
    );
    for (const vehicle of DEMO_VEHICLES) {
      insert.run(vehicle.make, vehicle.model, vehicle.category, vehicle.price, vehicle.quantity);
    }
  }
}
