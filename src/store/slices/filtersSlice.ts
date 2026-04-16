import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BodyType,
  CarStatus,
  FuelType,
  Transmission,
  DriveType,
  CarColor,
} from "../../types";

export interface FiltersState {
  status: CarStatus;

  // Массивы
  brands: string[];
  body_types: BodyType[];
  transmissions: Transmission[];
  fuel_types: FuelType[];
  drive_types: DriveType[];
  colors: CarColor[]; // 👈 Теперь строго типизировано
  feature_ids: number[]; // 👈 Для дополнительных опций (Кондиционер, CarPlay и т.д.)

  // Диапазоны
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  min_mileage?: number;
  max_mileage?: number;
  min_power?: number;
  max_power?: number;
  min_rating?: number; // 👈 ДОБАВЛЕНО: фильтр по минимальному рейтингу (4.0, 4.5 и т.д.)

  // Разное
  sort_by: string;
  startDate: string | null;
  endDate: string | null;
  onlyFavorites: boolean;
}

const initialState: FiltersState = {
  status: "AVAILABLE",
  brands: [],
  body_types: [],
  transmissions: [],
  fuel_types: [],
  drive_types: [],
  colors: [],
  feature_ids: [],
  sort_by: "newest",
  startDate: null,
  endDate: null,
  onlyFavorites: false,
  // Диапазоны (включая min_rating) по умолчанию равны undefined, поэтому их можно не прописывать
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    applyFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      return { ...state, ...action.payload };
    },
    resetFilters: () => {
      return initialState;
    },
  },
});

export const { applyFilters, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
