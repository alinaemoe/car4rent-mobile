// src/api/axios-instance.ts
import axios from "axios";
import { storage } from "../utils/storage";
import { Platform } from "react-native";

// ⚠️ ВАЖНО: Для эмулятора Android используй 10.0.2.2 вместо localhost.
// Для iOS симулятора можно использовать http://localhost:3000
// Если тестируешь на реальном устройстве, пиши IP своего компьютера в локальной сети (например, 192.168.1.15)
let BACKEND_URL = "http://localhost:3000"; // По умолчанию для Web и iOS

if (Platform.OS === "android") {
  BACKEND_URL = "http://10.0.2.2:3000"; // Магический мост для Android-эмулятора
}

// ⚠️ ЕСЛИ ТЕСТИРУЕШЬ НА РЕАЛЬНОМ ТЕЛЕФОНЕ ПО WI-FI,
// раскомментируй строку ниже и впиши IP своего компьютера:
// BACKEND_URL = 'http://192.168.1.x:3000';

export const API_URL = BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 секунд на ответ, иначе ошибка
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор ЗАПРОСА: перед отправкой приклеиваем токен
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Интерцептор ОТВЕТА: ловим глобальные ошибки (например, протухший токен)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Если бэкенд сказал "Доступ запрещен" или "Токен недействителен"
    if (error.response && error.response.status === 401) {
      // Удаляем токен из хранилища
      await storage.removeToken();

      // В идеале тут мы еще должны сбросить стейт Redux,
      // но чтобы не было циклической зависимости, мы сделаем это на уровне UI или хуков.
    }
    return Promise.reject(error);
  },
);
