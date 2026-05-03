// src/screens/Catalog/constants.ts
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
  { id: "brand", label: "Марка" },
  { id: "body_type", label: "Тип кузова" },
  { id: "transmission", label: "Коробка" },
];

// === ПРЕСЕТЫ КЛАССОВ (UI карточки) ===
export const CAR_CLASSES = [
  {
    id: "BUDGET",
    label: "Бюджет",
    priceText: "до 2500 Br",
    minPrice: 0,
    maxPrice: 2500,
    img: require("@/assets/images/classes/budget.png"), // Маленький хэтчбек
  },
  {
    id: "STANDARD",
    label: "Стандарт",
    priceText: "2500 - 4500 Br",
    minPrice: 2500,
    maxPrice: 4500,
    img: require("@/assets/images/classes/standard.png"), // Обычный седан
  },
  {
    id: "COMFORT_PLUS",
    label: "Комфорт+",
    priceText: "4500 - 7500 Br",
    minPrice: 4500,
    maxPrice: 7500,
    img: require("@/assets/images/classes/comfort.png"), // Хороший кроссовер
  },
  {
    id: "BUSINESS",
    label: "Бизнес",
    priceText: "7500 - 12000 Br",
    minPrice: 7500,
    maxPrice: 12000,
    img: require("@/assets/images/classes/business.png"), // Представительский седан
  },
  {
    id: "PREMIUM",
    label: "Премиум",
    priceText: "12000 - 25000 Br",
    minPrice: 12000,
    maxPrice: 25000,
    img: require("@/assets/images/classes/premium.png"), // Тяжелый внедорожник
  },
  {
    id: "ELITE",
    label: "Элита",
    priceText: "от 25000 Br",
    minPrice: 25000,
    maxPrice: undefined,
    img: require("@/assets/images/classes/elite.png"), // Суперкар
  },
];
