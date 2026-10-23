import axios from "axios";
import { storage } from "../utils/storage";
import { store } from "../store"; // 👈 Импортируем store для логаута
import { logout } from "../store/slices/authSlice";

// Backend base URL comes from the environment (see .env.example):
//   web / iOS simulator   http://localhost:3000
//   Android emulator      http://10.0.2.2:3000   (default)
//   real phone on Wi-Fi   http://<your-computer-LAN-ip>:3000
//   production build      your deployed API URL, set as an EAS environment variable
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";
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

        // Очищаем react-query кеш, чтобы данные предыдущего пользователя не утекли следующему
        const { queryClient } = await import("../queryClient");
        queryClient.clear();

        storeModule.store.dispatch(authSliceModule.logout());

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
