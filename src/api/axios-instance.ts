import axios from "axios";
import { storage } from "../utils/storage";
import { store } from "../store"; // 👈 Импортируем store для логаута
import { logout } from "../store/slices/authSlice";

// =========================================================================
// 🌐 НАСТРОЙКА ПОДКЛЮЧЕНИЯ К БЭКЕНДУ
// Раскомментируй ТОЛЬКО ОДИН вариант, который тебе сейчас нужен
// =========================================================================

// ВАРИАНТ 1: Для браузера (Web) и iOS Симулятора
// const BACKEND_URL = "http://localhost:3000";

// ВАРИАНТ 2: Для эмулятора Android (Android Studio)
// const BACKEND_URL = "http://10.0.2.2:3000";

// ВАРИАНТ 3: Для РЕАЛЬНОГО телефона по Wi-Fi (Expo Go)
const BACKEND_URL = "http://192.168.1.80:3000";

// =========================================================================

export const API_URL = BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 👇 Интерцептор ЗАПРОСА
// src/api/axios-instance.ts

// ... (остальной код) ...

// 👇 Интерцептор ОТВЕТА
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔥 ИЗМЕНЕНИЕ: Не делаем рефреш, если это запрос на логаут!
    const isLogoutRequest = originalRequest.url?.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      !originalRequest._isRetry &&
      !isLogoutRequest
    ) {
      originalRequest._isRetry = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error("Нет refresh-токена");

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        await storage.setTokens(data.access_token, data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await storage.removeTokens();

        const { store } = require("../store");
        const { logout } = require("../store/slices/authSlice");

        store.dispatch(logout());

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// 👇 Интерцептор ОТВЕТА
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error("Нет refresh-токена");

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        await storage.setTokens(data.access_token, data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await storage.removeTokens();

        const storeModule = await import("../store");
        const authSliceModule = await import("../store/slices/authSlice");

        storeModule.store.dispatch(authSliceModule.logout());

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
