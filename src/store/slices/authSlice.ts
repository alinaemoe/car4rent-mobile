// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

import { RootState } from "..";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isAppReady: boolean; // Завершили ли мы проверку токена при старте?
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: false,
  isAppReady: false, // При старте аппки показываем Splash Screen, пока не проверим токен
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Успешный вход или восстановление сессии
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setGuestMode: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isGuest = true;
    },
    // Обновление только данных юзера (например, после верификации паспорта)
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isGuest = false; // При логауте сбрасываем и гостя, выкинет на экран входа
    },
    // Заканчиваем фазу загрузки приложения
    setAppReady: (state) => {
      state.isAppReady = true;
    },
  },
});

export const { setCredentials, updateUser, logout, setAppReady, setGuestMode } =
  authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

// Проверяет, гость ли это
export const selectIsGuest = (state: RootState) => state.auth.isGuest;

// Проверяет, является ли юзер партнером (LESSOR)
export const selectIsLessor = (state: RootState) =>
  state.auth.user?.roles?.includes("LESSOR") ?? false;

// Проверяет, является ли юзер админом
export const selectIsAdmin = (state: RootState) =>
  state.auth.user?.roles?.includes("ADMIN") ?? false;

// Проверяет, подтверждены ли документы
export const selectIsVerified = (state: RootState) =>
  state.auth.user?.is_documents_verified ?? false;

// Получить текущий статус юзера (ACTIVE, BANNED и тд)
export const selectUserStatus = (state: RootState) => state.auth.user?.status;
