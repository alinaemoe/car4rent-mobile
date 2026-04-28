import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme, // 👈 Импортируем хук темы
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  pricePerDay: number;
  days: number;
  finalRentPrice: number;
  onBookPress: () => void;
  onDatesPress: () => void;
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
  const cleanPrice = Number(parseFloat(price.toString()).toFixed(2));
  const finalPrice =
    cleanPrice % 1 === 0
      ? cleanPrice.toString()
      : cleanPrice.toString().replace(".", ",");
  return finalPrice.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const StickyFooter = ({
  pricePerDay,
  days,
  finalRentPrice,
  onBookPress,
  onDatesPress,
  startDate,
  endDate,
}: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  // 👇 Определяем, темная ли сейчас тема
  const theme = useColorScheme();
  const isDark = theme === "dark";

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          // 👇 МАГИЯ ТЕМНОЙ ТЕМЫ
          shadowColor: isDark ? "#979797" : "#000000",
          shadowOpacity: isDark ? 0.01 : 0.08, // Белая тень почти прозрачная
          borderTopWidth: isDark ? 0.1 : 0, // Включаем бордер только для темной темы
          borderTopColor: "transparent",
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 12,
        },
      ]}
    >
      {/* Левый блок (Цена и Даты) */}
      <TouchableOpacity
        style={styles.priceInfo}
        onPress={onDatesPress}
        activeOpacity={0.6}
      >
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
      </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 32 : 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    justifyContent: "space-between",
    // shadowColor и shadowOpacity мы вынесли в динамические стили
    elevation: 15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
  },

  priceInfo: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
    justifyContent: "center",
  },

  datesLayout: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 2,
  },

  oldPriceContainer: {
    position: "relative",
    marginRight: 6,
    justifyContent: "center",
  },
  oldPriceText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  strikeCurve: {
    position: "absolute",
    width: "115%",
    height: 16,
    borderTopWidth: 1.5,
    borderTopColor: "#999",
    borderRadius: 50,
    top: "35%",
    left: "-5%",
    transform: [{ rotate: "-4deg" }],
  },

  pricePrimary: {
    fontSize: 15,
    fontWeight: "bold",
  },
  perDayText: {
    fontSize: 14,
    fontWeight: "bold",
  },

  dateRange: {
    fontSize: 13,
    textDecorationLine: "underline",
    fontWeight: "400",
  },

  bookBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexShrink: 0,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
