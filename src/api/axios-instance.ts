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
  timeout: 10000, // 10 секунд на ответ, иначе ошибка
  headers: {
    "Content-Type": "application/json",
  },
});

// 👇 Интерцептор ЗАПРОСА: перед отправкой приклеиваем токен
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

// 👇 Интерцептор ОТВЕТА: ловим глобальные ошибки (например, протухший токен)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и мы еще не пробовали делать рефреш для ЭТОГО запроса
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true; // Ставим флаг, чтобы не уйти в бесконечный цикл

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error("Нет refresh-токена");

        // ВАЖНО: Делаем запрос через чистый axios, чтобы не зациклить интерцепторы!
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        // Сохраняем новые токены
        await storage.setTokens(data.access_token, data.refresh_token);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Если рефреш тоже протух — убиваем сессию и выкидываем на логин
        await storage.removeTokens();
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
