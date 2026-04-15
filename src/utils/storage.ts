import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 Для больших данных (переводы) лучше использовать AsyncStorage

const ACCESS_TOKEN_KEY = "car4rent_access_token";
const REFRESH_TOKEN_KEY = "car4rent_refresh_token";
const GUEST_MODE_KEY = "car4rent_guest_mode";
const LANGUAGE_KEY = "car4rent_language";
const TRANSLATIONS_CACHE_KEY = "car4rent_translations_cache";
const FAVORITES_KEY = "car4rent_favorites";

export const storage = {
  // === ТОКЕНЫ (Access + Refresh) ===
  setTokens: async (accessToken: string, refreshToken: string) => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error("Error saving tokens", error);
    }
  },

  getAccessToken: async () => {
    try {
      return Platform.OS === "web"
        ? localStorage.getItem(ACCESS_TOKEN_KEY)
        : await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      return Platform.OS === "web"
        ? localStorage.getItem(REFRESH_TOKEN_KEY)
        : await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  removeTokens: async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (error) {}
  },

  setGuestMode: async (isGuest: boolean) => {
    try {
      const value = isGuest ? "true" : "false";
      if (Platform.OS === "web") {
        localStorage.setItem(GUEST_MODE_KEY, value);
      } else {
        await AsyncStorage.setItem(GUEST_MODE_KEY, value);
      }
    } catch (error) {}
  },

  getGuestMode: async () => {
    try {
      const value =
        Platform.OS === "web"
          ? localStorage.getItem(GUEST_MODE_KEY)
          : await AsyncStorage.getItem(GUEST_MODE_KEY);
      return value === "true";
    } catch (error) {
      return false;
    }
  },

  // --- Язык (AsyncStorage / localStorage) ---
  setLanguage: async (langCode: string) => {
    try {
      if (Platform.OS === "web") localStorage.setItem(LANGUAGE_KEY, langCode);
      else await AsyncStorage.setItem(LANGUAGE_KEY, langCode);
    } catch (error) {
      console.error("Error saving language", error);
    }
  },
  getLanguage: async () => {
    try {
      if (Platform.OS === "web") return localStorage.getItem(LANGUAGE_KEY);
      return await AsyncStorage.getItem(LANGUAGE_KEY);
    } catch (error) {
      return null;
    }
  },

  // --- Кэш переводов (AsyncStorage / localStorage) ---
  setTranslationsCache: async (translations: any) => {
    try {
      const json = JSON.stringify(translations);
      if (Platform.OS === "web")
        localStorage.setItem(TRANSLATIONS_CACHE_KEY, json);
      else await AsyncStorage.setItem(TRANSLATIONS_CACHE_KEY, json);
    } catch (error) {
      console.error("Error saving translations cache", error);
    }
  },
  getTranslationsCache: async () => {
    try {
      const json =
        Platform.OS === "web"
          ? localStorage.getItem(TRANSLATIONS_CACHE_KEY)
          : await AsyncStorage.getItem(TRANSLATIONS_CACHE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      return null;
    }
  },

  setFavorites: async (carIds: number[]) => {
    try {
      const json = JSON.stringify(carIds);
      if (Platform.OS === "web") localStorage.setItem(FAVORITES_KEY, json);
      else await AsyncStorage.setItem(FAVORITES_KEY, json);
    } catch (error) {
      console.error("Error saving favorites", error);
    }
  },
  getFavorites: async (): Promise<number[]> => {
    try {
      const json =
        Platform.OS === "web"
          ? localStorage.getItem(FAVORITES_KEY)
          : await AsyncStorage.getItem(FAVORITES_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      return [];
    }
  },
};
