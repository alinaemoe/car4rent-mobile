import { axiosInstance } from "./axios-instance";
import { storage } from "../utils/storage";
import i18n from "../utils/i18n"; // импортируем наш настроенный инстанс

// Тип ответа от бэкенда
interface TranslationRecord {
  id: number;
  key: string;
  value: Record<string, string>; // { "ru": "Привет", "en": "Hello" }
}

export const fetchAndCacheTranslations = async () => {
  try {
    // 1. Идем на бэкенд (у тебя это публичный роут GET /translations)
    const { data } =
      await axiosInstance.get<TranslationRecord[]>("/translations");

    // 2. Превращаем массив в объект нужного формата:
    // { en: { translation: { key1: "val1" } }, ru: { translation: { key1: "val1" } } }
    const formattedResources: Record<
      string,
      { translation: Record<string, string> }
    > = {};

    data.forEach((item) => {
      // Проходимся по всем языкам в объекте value (ru, en, de...)
      Object.keys(item.value).forEach((langCode) => {
        if (!formattedResources[langCode]) {
          formattedResources[langCode] = { translation: {} };
        }
        // Записываем ключ и перевод
        formattedResources[langCode].translation[item.key] =
          item.value[langCode];
      });
    });

    // 3. Сохраняем в кэш
    await storage.setTranslationsCache(formattedResources);

    // 4. На лету обновляем i18next (чтобы изменения применились сразу без перезагрузки)
    Object.keys(formattedResources).forEach((lang) => {
      i18n.addResourceBundle(
        lang,
        "translation",
        formattedResources[lang].translation,
        true,
        true,
      );
    });

    console.log("✅ Переводы успешно обновлены с бэкенда");
    return true;
  } catch (error) {
    console.error("❌ Ошибка загрузки переводов:", error);
    // Если бэкенд недоступен, мы просто ничего не делаем.
    // i18next продолжит работать на старом кэше.
    return false;
  }
};
