import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { storage } from "../../utils/storage";

interface FavoritesState {
  carIds: number[];
  isLoaded: boolean; // Чтобы не мигали пустые сердечки при старте
}

const initialState: FavoritesState = {
  carIds: [],
  isLoaded: false,
};

// 1. При запуске приложения достаем лайки из памяти
export const loadFavorites = createAsyncThunk("favorites/load", async () => {
  return await storage.getFavorites();
});

// 2. Умный тоггл: меняет стейт и сразу сохраняет в память
export const toggleFavoriteThunk = createAsyncThunk(
  "favorites/toggle",
  async (carId: number, { getState }) => {
    const state = getState() as RootState;
    const currentFavorites = state.favorites.carIds;

    let newFavorites;
    if (currentFavorites.includes(carId)) {
      newFavorites = currentFavorites.filter((id) => id !== carId); // Удаляем
    } else {
      newFavorites = [...currentFavorites, carId]; // Добавляем
    }

    // Сохраняем в телефон
    await storage.setFavorites(newFavorites);
    return newFavorites;
  },
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadFavorites.fulfilled,
      (state, action: PayloadAction<number[]>) => {
        state.carIds = action.payload;
        state.isLoaded = true;
      },
    );
    builder.addCase(
      toggleFavoriteThunk.fulfilled,
      (state, action: PayloadAction<number[]>) => {
        state.carIds = action.payload;
      },
    );
  },
});

export default favoritesSlice.reducer;

// Селекторы для компонентов
export const selectFavoriteCarIds = (state: RootState) =>
  state.favorites.carIds;
export const selectIsCarFavorite = (state: RootState, carId: number) =>
  state.favorites.carIds.includes(carId);
