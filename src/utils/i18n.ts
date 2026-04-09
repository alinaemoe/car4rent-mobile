import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { storage } from "./storage";

// Дефолтные переводы (на случай, если мы запустили аппку первый раз без интернета)
const defaultResources = {
  en: {
    translation: {
      loading: "Loading...",
      error: "Error occurred",
    },
  },
  ru: {
    translation: {
      loading: "Загрузка...",
      error: "Произошла ошибка",
    },
  },
};

export const initI18n = async () => {
  // 1. Узнаем, какой язык юзер выбрал в прошлый раз (или ставим 'en' по умолчанию)
  const savedLang = (await storage.getLanguage()) || "en";

  // 2. Достаем кэш переводов (если он есть)
  const cachedTranslations = await storage.getTranslationsCache();

  // 3. Формируем финальный объект ресурсов.
  // Если кэша нет, используем defaultResources.
  const resources = cachedTranslations || defaultResources;

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLang, // текущий язык
    fallbackLng: "en", // если ключа нет в текущем языке, ищем в 'en'
    interpolation: {
      escapeValue: false, // React сам защищает от XSS
    },
    react: {
      useSuspense: false, // Отключаем, чтобы не было конфликтов с Expo Router
    },
  });
};

export default i18n;
