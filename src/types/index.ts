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

export enum DriveType {
  FWD = "FWD",
  RWD = "RWD",
  AWD = "AWD",
}

// 👇 НОВЫЙ ENUM ДЛЯ ЦВЕТА
export enum CarColor {
  WHITE = "WHITE",
  BLACK = "BLACK",
  GREY = "GREY",
  RED = "RED",
  BLUE = "BLUE",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  BROWN = "BROWN",
  PINK = "PINK",
  ORANGE = "ORANGE",
}

export interface CarImage {
  id: number;
  url: string;
  is_main: boolean;
}

// 👇 НОВЫЙ ТИП ДЛЯ ФИЧЕЙ
export interface Feature {
  id: number;
  name: string;
  icon_url?: string;
}

// === ПОЛНАЯ СУЩНОСТЬ АВТОМОБИЛЯ ===
export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  description: Record<string, string> | null;

  // Характеристики
  status: CarStatus;
  color: CarColor; // 👈 Теперь это Enum
  transmission: Transmission;
  fuel_type: FuelType;
  body_type: BodyType;
  drive_type: DriveType;

  // 👇 НОВЫЕ ХАРАКТЕРИСТИКИ С БЭКЕНДА
  horsepower: number;
  fuel_consumption: number;
  reviews_count?: number; // Количество отзывов (считается на лету)
  avg_rating?: number; // Средний рейтинг (добавим позже)

  // Цены и лимиты
  price_per_day: number;
  mileage_limit_per_day: number;
  price_per_km_over_limit: number;
  current_mileage: number;

  // Картинки и связи
  images: CarImage[];
  owner?: User;
  features?: Feature[]; // 👈 Добавили фичи

  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
