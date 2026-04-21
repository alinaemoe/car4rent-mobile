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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background }, // borderTopColor убрали, чтобы не было грязных линий
      ]}
    >
      <View style={styles.priceInfo}>
        {!hasDates ? (
          <Text style={[styles.pricePrimary, { color: colors.textPrimary }]}>
            {t("from", "От")} {pricePerDay} ₽{" "}
            <Text style={[styles.perDayText, { color: colors.textPrimary }]}>
              / {t("day", "сутки")}
            </Text>
          </Text>
        ) : (
          <View>
            <View style={styles.priceRow}>
              {hasDiscount && (
                <Text style={styles.oldPrice}>{pricePerDay} ₽</Text>
              )}
              <Text
                style={[styles.pricePrimary, { color: colors.textPrimary }]}
              >
                {discountedDailyPrice} ₽{" "}
                <Text
                  style={[styles.perDayText, { color: colors.textPrimary }]}
                >
                  / {t("day", "сутки")}
                </Text>
              </Text>
            </View>
            <Text style={[styles.dateRange, { color: colors.textPrimary }]}>
              {formatDates()}
            </Text>
          </View>
        )}
      </View>

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
    // 🔥 МАГИЯ ЗДЕСЬ: Отрываем футер от общего потока
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    justifyContent: "space-between",

    // Красивая тень, чтобы футер "парил"
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  priceInfo: {
    flex: 1,
    justifyContent: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  oldPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 6,
  },
  pricePrimary: {
    fontSize: 18,
    fontWeight: "bold",
  },
  perDayText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateRange: {
    fontSize: 15,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  bookBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
