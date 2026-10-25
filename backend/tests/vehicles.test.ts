import request from "supertest";
import {
  cleanupTestContext,
  createTestContext,
  promoteToAdmin,
  registerUser,
  TestContext,
} from "./helpers";

describe("Vehicle API", () => {
  let ctx: TestContext;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    ctx = createTestContext();

    const user = await registerUser(ctx.app);
    userToken = user.res.body.token;

    const admin = await registerUser(ctx.app, {
      name: "Admin",
      email: "admin@example.com",
      password: "AdminPass123",
    });
    promoteToAdmin(ctx.db, "admin@example.com");
    const login = await request(ctx.app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "AdminPass123",
    });
    adminToken = login.body.token;
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  const sedan = {
    make: "Toyota",
    model: "Camry",
    category: "Sedan",
    price: 24999.99,
    quantity: 3,
  };

  it("rejects unauthenticated vehicle access", async () => {
    const res = await request(ctx.app).get("/api/vehicles");
    expect(res.status).toBe(401);
  });

  it("creates and lists vehicles for authenticated users", async () => {
    const created = await request(ctx.app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send(sedan);

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      ...sedan,
      id: expect.any(Number),
    });

    const list = await request(ctx.app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);

    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].make).toBe("Toyota");
  });

  it("validates vehicle payloads", async () => {
    const res = await request(ctx.app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ make: "", model: "X", category: "SUV", price: -1, quantity: -4 });

    expect(res.status).toBe(400);
  });

  it("searches by make, model, category, and price range", async () => {
    await request(ctx.app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send(sedan);
    await request(ctx.app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "Tesla",
        model: "Model Y",
        category: "SUV",
        price: 45999,
        quantity: 2,
      });

    const byMake = await request(ctx.app)
      .get("/api/vehicles/search")
      .query({ make: "tesla" })
      .set("Authorization", `Bearer ${userToken}`);
    const byRange = await request(ctx.app)
      .get("/api/vehicles/search")
      .query({ minPrice: 20000, maxPrice: 30000 })
      .set("Authorization", `Bearer ${userToken}`);
    const byCategory = await request(ctx.app)
      .get("/api/vehicles/search")
      .query({ category: "SUV" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(byMake.body).toHaveLength(1);
    expect(byMake.body[0].model).toBe("Model Y");
    expect(byRange.body).toHaveLength(1);
    expect(byRange.body[0].make).toBe("Toyota");
    expect(byCategory.body).toHaveLength(1);
  });

  it("updates a vehicle", async () => {
    const created = await request(ctx.app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send(sedan);

    const updated = await request(ctx.app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 22999, quantity: 5 });

    expect(updated.status).toBe(200);
    expect(updated.body.price).toBe(22999);
    expect(updated.body.quantity).toBe(5);
    expect(updated.body.make).toBe("Toyota");
  });

  it("returns 404 when updating a missing vehicle", async () => {
    const res = await request(ctx.app)
      .put("/api/vehicles/999")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 1 });

    expect(res.status).toBe(404);
  });

  it("lets only admins delete vehicles", async () => {
    const created = await request(ctx.app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send(sedan);

    const forbidden = await request(ctx.app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set("Authorization", `Bearer ${userToken}`);
    const allowed = await request(ctx.app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(204);

    const list = await request(ctx.app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);
    expect(list.body).toHaveLength(0);
  });
});
