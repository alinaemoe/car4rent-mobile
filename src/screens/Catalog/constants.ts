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
    id: "ECONOMY",
    label: "Эконом",
    priceText: "до 3000 ₽",
    minPrice: 0,
    maxPrice: 3000,
    img: require("@/assets/images/icon.png"),
  },
  {
    id: "COMFORT",
    label: "Комфорт",
    priceText: "3000 - 6000 ₽",
    minPrice: 3000,
    maxPrice: 6000,
    img: require("@/assets/images/icon.png"),
  },
  {
    id: "BUSINESS",
    label: "Бизнес",
    priceText: "от 6000 ₽",
    minPrice: 6000,
    maxPrice: undefined, // Бесконечность
    img: require("@/assets/images/icon.png"),
  },
];
