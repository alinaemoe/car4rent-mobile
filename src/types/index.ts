// src/types/index.ts

export type Role = "ADMIN" | "MANAGER" | "CLIENT" | "LESSOR";

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

export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";

export enum BodyType {
  SEDAN = "SEDAN",
  SUV = "SUV",
  HATCHBACK = "HATCHBACK",
  COUPE = "COUPE",
  CABRIOLET = "CABRIOLET",
  MINIVAN = "MINIVAN",
}

export enum FuelType {
  PETROL = "PETROL",
  DIESEL = "DIESEL",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID",
}

export enum Transmission {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
  ROBOT = "ROBOT",
}
export type DriveType = "FWD" | "RWD" | "AWD";

export interface CarImage {
  id: number;
  url: string;
  is_main: boolean;
}

// === ПОЛНАЯ СУЩНОСТЬ АВТОМОБИЛЯ ===
export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;

  // Мультиязычные поля
  color: Record<string, string>;
  description: Record<string, string> | null;

  // Характеристики
  status: CarStatus;
  transmission: Transmission;
  fuel_type: FuelType;
  body_type: BodyType;
  drive_type: DriveType;

  // Цены и лимиты
  price_per_day: number;
  mileage_limit_per_day: number;
  price_per_km_over_limit: number;
  current_mileage: number;

  // Картинки
  images: CarImage[];

  // 👇 ОПЦИОНАЛЬНЫЕ СВЯЗИ
  // Делаем их опциональными (с ?), потому что в "Каталоге" мы их не подтягиваем для скорости,
  // а на экране "Деталей машины" они уже придут с бэкенда.
  owner?: User;
  // location?: Location; // раскомментируешь, когда добавишь тип Location
  // features?: Feature[]; // раскомментируешь, когда добавишь тип Feature

  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
