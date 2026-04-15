import { LocaleConfig } from "react-native-calendars";

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

export const QUICK_FILTERS = [
  { id: "brand", label: "Бренд" },
  { id: "price", label: "Цена" },
  { id: "discounts", label: "Скидки" },
  { id: "body_type", label: "Тип кузова" },
  { id: "no_deposit", label: "Без залога" },
];

export const CAR_CLASSES = [
  {
    id: "ECONOMY",
    label: "Эконом",
    price: "от 2100 ₽",
    img: require("@/assets/images/icon.png"),
  },
  {
    id: "COMFORT",
    label: "Комфорт",
    price: "2100-3500 ₽",
    img: require("@/assets/images/icon.png"),
  },
  {
    id: "BUSINESS",
    label: "Бизнес",
    price: "от 5000 ₽",
    img: require("@/assets/images/icon.png"),
  },
];
