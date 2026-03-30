// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAppReady: boolean; // Завершили ли мы проверку токена при старте?
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
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
    // Обновление только данных юзера (например, после верификации паспорта)
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // Выход из аккаунта
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    // Заканчиваем фазу загрузки приложения
    setAppReady: (state) => {
      state.isAppReady = true;
    },
  },
});

export const { setCredentials, updateUser, logout, setAppReady } =
  authSlice.actions;
export default authSlice.reducer;
