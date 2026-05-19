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
// === ТАБЛЕТКИ БЫСТРЫХ ФИЛЬТРОВ (Шторки) ===
export const QUICK_FILTERS = [
  { id: "brand", labelKey: "filter.brand", defaultLabel: "Марка" },
  { id: "body_type", labelKey: "filter.body_type", defaultLabel: "Тип кузова" },
  {
    id: "transmission",
    labelKey: "filter.transmission",
    defaultLabel: "Коробка",
  },
];

// === ПРЕСЕТЫ КЛАССОВ (UI карточки) ===
export const CAR_CLASSES = [
  {
    id: "BUDGET",
    labelKey: "class.budget",
    defaultLabel: "Бюджет",
    minPrice: 0,
    maxPrice: 70,
    type: "up_to", // Флаг для рендера строки "до 70 Br"
    img: require("@/assets/images/classes/budget.png"),
  },
  {
    id: "STANDARD",
    labelKey: "class.standard",
    defaultLabel: "Стандарт",
    minPrice: 70,
    maxPrice: 130,
    type: "range", // Флаг для рендера строки "70 - 130 Br"
    img: require("@/assets/images/classes/standard.png"),
  },
  {
    id: "COMFORT_PLUS",
    labelKey: "class.comfort_plus",
    defaultLabel: "Комфорт+",
    minPrice: 130,
    maxPrice: 250,
    type: "range",
    img: require("@/assets/images/classes/comfort.png"),
  },
  {
    id: "BUSINESS",
    labelKey: "class.business",
    defaultLabel: "Бизнес",
    minPrice: 250,
    maxPrice: 500,
    type: "range",
    img: require("@/assets/images/classes/business.png"),
  },
  {
    id: "PREMIUM",
    labelKey: "class.premium",
    defaultLabel: "Премиум",
    minPrice: 500,
    maxPrice: 1000,
    type: "range",
    img: require("@/assets/images/classes/premium.png"),
  },
  {
    id: "ELITE",
    labelKey: "class.elite",
    defaultLabel: "Элита",
    minPrice: 1000,
    maxPrice: undefined,
    type: "from", // Флаг для рендера строки "от 1000 Br"
    img: require("@/assets/images/classes/elite.png"),
  },
];
