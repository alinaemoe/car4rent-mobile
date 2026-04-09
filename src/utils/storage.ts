import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 Для больших данных (переводы) лучше использовать AsyncStorage

const ACCESS_TOKEN_KEY = "car4rent_access_token";
const REFRESH_TOKEN_KEY = "car4rent_refresh_token";
const LANGUAGE_KEY = "car4rent_language";
const TRANSLATIONS_CACHE_KEY = "car4rent_translations_cache";

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
};
