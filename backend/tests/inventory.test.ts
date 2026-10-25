import request from "supertest";
import {
  cleanupTestContext,
  createTestContext,
  promoteToAdmin,
  registerUser,
  TestContext,
} from "./helpers";

describe("Inventory API", () => {
  let ctx: TestContext;
  let userToken: string;
  let adminToken: string;
  let vehicleId: number;

  beforeEach(async () => {
    ctx = createTestContext();

    const user = await registerUser(ctx.app);
    userToken = user.res.body.token;

    await registerUser(ctx.app, {
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

    const created = await request(ctx.app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 21999,
        quantity: 1,
      });
    vehicleId = created.body.id;
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  it("purchases a vehicle and decreases quantity", async () => {
    const res = await request(ctx.app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(0);
  });

  it("refuses a purchase when stock is empty", async () => {
    await request(ctx.app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    const res = await request(ctx.app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(409);
  });

  it("lets only admins restock vehicles", async () => {
    const forbidden = await request(ctx.app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 4 });

    const allowed = await request(ctx.app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 4 });

    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(allowed.body.quantity).toBe(5);
  });

  it("validates restock quantity", async () => {
    const res = await request(ctx.app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
  });
});
