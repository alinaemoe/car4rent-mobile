// src/store/slices/filtersSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BodyType, CarStatus, FuelType, Transmission } from "../../types";

export interface FiltersState {
  status: CarStatus;
  brands: string[];
  body_types: BodyType[];
  transmissions: Transmission[];
  fuel_types: FuelType[];
  colors: string[];
  min_price?: number;
  max_price?: number;
  sort_by: string;
  // 👇 НОВЫЕ ПОЛЯ
  startDate: string | null;
  endDate: string | null;
  carClass: "ECONOMY" | "COMFORT" | "BUSINESS" | null;
  onlyFavorites: boolean; // 👈 ДОБАВЛЕНО
}

const initialState: FiltersState = {
  status: "AVAILABLE",
  brands: [],
  body_types: [],
  transmissions: [],
  fuel_types: [],
  colors: [],
  sort_by: "newest",
  startDate: null,
  endDate: null,
  carClass: null,
  onlyFavorites: false,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    // Используем applyFilters (как договорились раньше)
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
