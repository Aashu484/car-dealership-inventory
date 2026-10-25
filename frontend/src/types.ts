export type Role = "user" | "admin";

export type User = {
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

export type SearchFilters = {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
};
