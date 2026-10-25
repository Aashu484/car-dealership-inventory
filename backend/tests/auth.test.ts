import request from "supertest";
import {
  cleanupTestContext,
  createTestContext,
  registerUser,
  TestContext,
} from "./helpers";

describe("Auth API", () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  it("registers a new user and returns a JWT plus user profile", async () => {
    const { res } = await registerUser(ctx.app);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      name: "Test Buyer",
      email: "buyer@example.com",
      role: "user",
    });
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects duplicate emails", async () => {
    await registerUser(ctx.app);
    const { res } = await registerUser(ctx.app);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already/i);
  });

  it("rejects invalid registration payloads", async () => {
    const res = await request(ctx.app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "123",
    });

    expect(res.status).toBe(400);
  });

  it("logs in an existing user", async () => {
    await registerUser(ctx.app);

    const res = await request(ctx.app).post("/api/auth/login").send({
      email: "buyer@example.com",
      password: "Password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe("buyer@example.com");
  });

  it("rejects unknown users and bad passwords", async () => {
    await registerUser(ctx.app);

    const unknown = await request(ctx.app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "Password123",
    });
    const badPassword = await request(ctx.app).post("/api/auth/login").send({
      email: "buyer@example.com",
      password: "WrongPassword1",
    });

    expect(unknown.status).toBe(401);
    expect(badPassword.status).toBe(401);
  });
});
