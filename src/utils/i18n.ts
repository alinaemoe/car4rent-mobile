import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { storage } from "./storage";

const defaultResources = {
  en: {
    translation: {
      loading: "Loading...",
      error: "Error occurred",
      select_dates: "Select dates",
      // Месяцы для форматирования дат
      months_short_0: "Jan",
      months_short_1: "Feb",
      months_short_2: "Mar",
      months_short_3: "Apr",
      months_short_4: "May",
      months_short_5: "Jun",
      months_short_6: "Jul",
      months_short_7: "Aug",
      months_short_8: "Sep",
      months_short_9: "Oct",
      months_short_10: "Nov",
      months_short_11: "Dec",
      // Плюрализация дней
      days_count_one: "{{count}} day",
      days_count_other: "{{count}} days",
    },
  },
  ru: {
    translation: {
      loading: "Загрузка...",
      error: "Произошла ошибка",
      select_dates: "Выберите даты",
      // Склоняем месяцы так, чтобы звучало естественно: "30 Апр", "9 Мая"
      months_short_0: "Янв",
      months_short_1: "Фев",
      months_short_2: "Мар",
      months_short_3: "Апр",
      months_short_4: "Мая",
      months_short_5: "Июн",
      months_short_6: "Июл",
      months_short_7: "Авг",
      months_short_8: "Сен",
      months_short_9: "Окт",
      months_short_10: "Ноя",
      months_short_11: "Дек",
      // В русском языке слово "сутки" ведет себя хитро,
      // но для маркетплейсов часто используют универсальное "суток" или склоняют:
      days_count_one: "{{count}} сутки",
      days_count_few: "{{count}} суток",
      days_count_many: "{{count}} суток",
      days_count_other: "{{count}} суток", // fallback
    },
  },
};

export const initI18n = async () => {
  const savedLang = (await storage.getLanguage()) || "ru"; // 👈 Поставим 'ru' дефолтом для удобства
  const cachedTranslations = await storage.getTranslationsCache();

  // 🔥 МАГИЯ ТУТ: Глубокий мерж локальных словарей и кэша с бэка
  const resources = {
    en: {
      translation: {
        ...defaultResources.en.translation,
        ...(cachedTranslations?.en?.translation || {}),
      },
    },
    ru: {
      translation: {
        ...defaultResources.ru.translation,
        ...(cachedTranslations?.ru?.translation || {}),
      },
    },
  };

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLang,
    fallbackLng: "ru",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
};

export default i18n;
