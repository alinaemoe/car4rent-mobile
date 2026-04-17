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
}

export const StickyFooter = ({
  pricePerDay,
  days,
  finalRentPrice,
  onBookPress,
  startDate,
}: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderTopColor: colors.border },
      ]}
    >
      <View style={styles.priceInfo}>
        <Text style={[styles.pricePerDay, { color: colors.textPrimary }]}>
          {pricePerDay} ₽{" "}
          <Text style={styles.perDayText}>/ {t("day", "сутки")}</Text>
        </Text>
        {days > 0 && startDate ? (
          <Text style={[styles.total, { color: colors.textSecondary }]}>
            {t("total_for", "Итого за")} {days} {t("days_short", "сут.")}:{" "}
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
              {finalRentPrice} ₽
            </Text>
          </Text>
        ) : (
          <Text style={[styles.total, { color: colors.textSecondary }]}>
            Выберите даты
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.bookBtn, { backgroundColor: colors.accent }]}
        onPress={onBookPress}
        activeOpacity={0.8}
      >
        <Text style={styles.bookBtnText}>{t("book", "Забронировать")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16, // SafeArea
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  priceInfo: { flex: 1 },
  pricePerDay: { fontSize: 18, fontWeight: "bold" },
  perDayText: { fontSize: 13, color: "#888", fontWeight: "400" },
  total: { fontSize: 13, marginTop: 4 },
  bookBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  bookBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
