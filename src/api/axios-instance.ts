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
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
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

        // 🔥 ВОТ ОНО! ДИНАМИЧЕСКИЙ ИМПОРТ 🔥
        // Мы вызываем store только тогда, когда рефреш реально сдох.
        // Это полностью убивает Require cycle!
        const { store } = require("../store");
        const { logout } = require("../store/slices/authSlice");

        store.dispatch(logout());

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
