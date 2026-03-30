// src/types/index.ts

export type Role = "ADMIN" | "MANAGER" | "CLIENT";

export interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string | null;
  roles: Role[];
  status: "ACTIVE" | "BANNED" | "PENDING_VERIFICATION";
  is_verified: boolean;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  price_per_day: number;
  current_mileage: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  images: { id: number; url: string; is_main: boolean }[];
  // Остальные поля можно добавлять по мере необходимости
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
