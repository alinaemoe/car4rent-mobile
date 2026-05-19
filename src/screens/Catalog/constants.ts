// src/screens/Catalog/constants.ts
import i18next from "i18next";
import { LocaleConfig } from "react-native-calendars";
// Настройки локализации для календаря
LocaleConfig.locales["ru"] = {
  monthNames: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ],
  monthNamesShort: [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ],
  dayNames: [
    "воскресенье",
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
  ],
  dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  today: "Сегодня",
};
LocaleConfig.defaultLocale = "ru";

// Максимальная цена для слайдера (Оставляем, так как это константа UI)
export const MAX_SLIDER_PRICE = 30000;

// === ТАБЛЕТКИ БЫСТРЫХ ФИЛЬТРОВ (Шторки) ===
export const QUICK_FILTERS = [
  { id: "brand", label: i18next.t("filter.brand", "Марка") },
  { id: "body_type", label: i18next.t("filter.body_type", "Тип кузова") },
  { id: "transmission", label: i18next.t("filter.transmission", "Коробка") },
];

// === ПРЕСЕТЫ КЛАССОВ (UI карточки) ===
export const CAR_CLASSES = [
  {
    id: "BUDGET",
    label: i18next.t("class.budget", "Бюджет"),
    priceText: `${i18next.t("common.up_to", "до")} 70 ${i18next.t("common.currency_br", "Br")}`,
    minPrice: 0,
    maxPrice: 70,
    img: require("@/assets/images/classes/budget.png"), // Маленький хэтчбек (типа Logan)
  },
  {
    id: "STANDARD",
    label: i18next.t("class.standard", "Стандарт"),
    priceText: `70 - 130 ${i18next.t("common.currency_br", "Br")}`,
    minPrice: 70,
    maxPrice: 130,
    img: require("@/assets/images/classes/standard.png"), // Обычный седан (Polo, Rio)
  },
  {
    id: "COMFORT_PLUS",
    label: i18next.t("class.comfort_plus", "Комфорт+"),
    priceText: `130 - 250 ${i18next.t("common.currency_br", "Br")}`,
    minPrice: 130,
    maxPrice: 250,
    img: require("@/assets/images/classes/comfort.png"), // Хороший кроссовер (Geely Coolray)
  },
  {
    id: "BUSINESS",
    label: i18next.t("class.business", "Бизнес"),
    priceText: `250 - 500 ${i18next.t("common.currency_br", "Br")}`,
    minPrice: 250,
    maxPrice: 500,
    img: require("@/assets/images/classes/business.png"), // BMW 5, Mercedes E-class
  },
  {
    id: "PREMIUM",
    label: i18next.t("class.premium", "Премиум"),
    priceText: `500 - 1000 ${i18next.t("common.currency_br", "Br")}`,
    minPrice: 500,
    maxPrice: 1000,
    img: require("@/assets/images/classes/premium.png"), // Тяжелый внедорожник
  },
  {
    id: "ELITE",
    label: i18next.t("class.elite", "Элита"),
    priceText: `${i18next.t("common.from", "от")} 1000 ${i18next.t("common.currency_br", "Br")}`,
    minPrice: 1000,
    maxPrice: undefined,
    img: require("@/assets/images/classes/elite.png"), // Суперкар
  },
];
