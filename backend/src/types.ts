export type Role = "user" | "admin";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type Vehicle = {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
};

export type AppConfig = {
  jwtSecret: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
