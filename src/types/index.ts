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
  is_email_verified: boolean;
  is_documents_verified: boolean;
  documents?: UserDocument[];
}

export type DocType = "PASSPORT" | "DRIVER_LICENSE";
export type DocStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface UserDocument {
  id: number;
  type: DocType;
  image_url: string;
  document_number?: string;
  status: DocStatus;
  rejection_reason?: string | null;
  created_at: string;
}

export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";

export type BodyType = string;
export type FuelType = string;
export type Transmission = string;
export type DriveType = string;
export type CarColor = string;

// Типы для наших новых настроек из словарей
export interface DictOption {
  id: string;
  label: string;
}

export interface DictColorOption {
  id: string;
  hex: string;
  label: string;
}

export interface Feature {
  id: number;
  internal_name: string;
  description: Record<string, string>;
  icon_url?: string | null;
}

export interface CarImage {
  id: number;
  url: string;
  is_main: boolean;
}

export interface CarReviewPreview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userFirstName: string;
  userLastName: string;
}

export interface LocationInfo {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
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
  booked_dates?: { startDate: string; endDate: string }[];
  latest_reviews?: CarReviewPreview[];
  location?: LocationInfo | null;

  // Цены и лимиты
  price_per_day: number;
  mileage_limit_per_day: number;
  price_per_km_over_limit: number;
  current_mileage: number;

  deposit_amount: number; // Залог
  insurance_type: string; // Тип страховки ('ОСАГО' и т.д.)
  min_age: number; // Мин. возраст водителя
  min_experience: number; // Мин. стаж вождения

  /** * Скидки от количества дней.
   * Формат: { "3": 5, "7": 10 } (от 3х дней - 5%)
   */
  discount_tiers: Record<string, number> | null;

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
