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
// const BACKEND_URL = "http://192.168.100.63:3000";

// ВАРИАНТ 4: Продакшн-сервер (APK-сборка через EAS)
const BACKEND_URL = "http://203.0.113.10:3000";

// =========================================================================

export const API_URL = BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Не делаем рефреш, если это запрос на логаут
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
        // Если рефреш сдох — чистим сторадж и выкидываем юзера
        await storage.removeTokens();

        const storeModule = await import("../store");
        const authSliceModule = await import("../store/slices/authSlice");

        // Если у тебя есть глобальный queryClient, импортируй его и сделай queryClient.clear() здесь.

        storeModule.store.dispatch(authSliceModule.logout());

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
