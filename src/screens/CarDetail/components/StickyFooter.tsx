import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  pricePerDay: number;
  days: number;
  finalRentPrice: number;
  onBookPress: () => void;
  startDate: string | null;
  endDate: string | null;
}

const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const formatPrice = (price: number) => {
  // 1. parseFloat уберет лишние .00, если их нет, но оставит .32
  // 2. Сначала форматируем число, чтобы не потерять копейки при замене
  const cleanPrice = Number(parseFloat(price.toString()).toFixed(2));

  // Если после точки идет 00, преобразуем в целое
  const finalPrice =
    cleanPrice % 1 === 0
      ? cleanPrice.toString()
      : cleanPrice.toString().replace(".", ",");

  // 3. Добавляем разделение тысяч пробелом
  return finalPrice.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const StickyFooter = ({
  pricePerDay,
  days,
  finalRentPrice,
  onBookPress,
  startDate,
  endDate,
}: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  const hasDates = startDate && endDate;

  const discountedDailyPrice =
    days > 0 ? Math.floor(finalRentPrice / days) : pricePerDay;
  const hasDiscount = discountedDailyPrice < pricePerDay;

  const formatDates = () => {
    if (!startDate || !endDate) return null;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const m1 = MONTHS_RU[d1.getMonth()];
    const m2 = MONTHS_RU[d2.getMonth()];

    if (
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    ) {
      return `${d1.getDate()} - ${d2.getDate()} ${m1}`;
    }
    return `${d1.getDate()} ${m1} - ${d2.getDate()} ${m2}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Левый блок с ценами (строго ограничен по ширине) */}
      <View style={styles.priceInfo}>
        {!hasDates ? (
          <Text
            style={[styles.pricePrimary, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {t("from", "От")} {formatPrice(pricePerDay)} ₽{" "}
            <Text style={styles.perDayText}>/ {t("day", "сутки")}</Text>
          </Text>
        ) : (
          <View style={styles.datesLayout}>
            <View style={styles.priceRow}>
              {hasDiscount && (
                <View style={styles.oldPriceContainer}>
                  <Text style={styles.oldPriceText}>
                    {formatPrice(pricePerDay)} ₽
                  </Text>
                  {/* 🔥 Имитация ручного зачеркивания дугой */}
                  <View style={styles.strikeCurve} />
                </View>
              )}
              <Text
                style={[styles.pricePrimary, { color: colors.textPrimary }]}
              >
                {formatPrice(discountedDailyPrice)} ₽{" "}
                <Text style={styles.perDayText}>/ {t("day", "сутки")}</Text>
              </Text>
            </View>

            <Text
              style={[styles.dateRange, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {formatDates()}
            </Text>
          </View>
        )}
      </View>

      {/* Правый блок: Кнопка */}
      <TouchableOpacity
        style={[styles.bookBtn, { backgroundColor: colors.accent }]}
        onPress={onBookPress}
        activeOpacity={0.8}
      >
        <Text style={styles.bookBtnText}>
          {!hasDates
            ? t("check_dates", "Проверить даты")
            : t("book", "Забронировать")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16, // Чуть уменьшили боковые отступы
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 32 : 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  // 🔥 ГАРАНТИЯ, ЧТО ТЕКСТ НЕ НАЕДЕТ НА КНОПКУ
  priceInfo: {
    flex: 1,
    flexShrink: 1, // Позволяет блоку сжиматься
    marginRight: 12, // Обязательный отступ от кнопки
    justifyContent: "center",
  },

  datesLayout: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap", // Разрешаем перенос, если экран ну очень узкий
    marginBottom: 2,
  },

  // Старая цена и ДУГА
  oldPriceContainer: {
    position: "relative",
    marginRight: 6,
    justifyContent: "center",
  },
  oldPriceText: {
    fontSize: 14, // Сделали мельче
    color: "#999",
    fontWeight: "500",
  },
  strikeCurve: {
    position: "absolute",
    width: "115%",
    height: 16, // Высота невидимого эллипса
    borderTopWidth: 1.5, // Показываем только верхнюю границу
    borderTopColor: "#999",
    borderRadius: 50, // Делает границу дугообразной
    //! TODO
    top: "35%", // Сдвигаем дугу на центр текста
    left: "-5%",
    transform: [{ rotate: "-4deg" }], // Слегка наклоняем
  },

  // Основная цена
  pricePrimary: {
    fontSize: 15, // Сделали мельче
    fontWeight: "bold",
  },
  perDayText: {
    fontSize: 14, // Сделали мельче
    fontWeight: "bold",
  },

  // Даты
  dateRange: {
    fontSize: 13, // Сделали мельче
    textDecorationLine: "underline",
    fontWeight: "400",
  },

  // Кнопка
  bookBtn: {
    paddingVertical: 12, // Сделали кнопку чуть компактнее
    paddingHorizontal: 16,
    borderRadius: 12,
    flexShrink: 0, // Запрещаем кнопке сжиматься
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 14, // Сделали мельче
    fontWeight: "bold",
  },
});
