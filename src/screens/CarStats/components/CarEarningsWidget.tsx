import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { CarRentalHistoryItem } from "@/src/api/queries/useCarRentalsHistory";

interface Props {
  rentals: CarRentalHistoryItem[];
}

export const CarEarningsWidget = ({ rentals }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  // Считаем доходы прямо здесь
  const { totalAllTime, totalThisMonth } = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let allTime = 0;
    let thisMonth = 0;

    rentals.forEach((rental) => {
      // Считаем только успешно завершенные или активные (оплаченные) аренды
      if (rental.status === "COMPLETED" || rental.status === "ACTIVE") {
        allTime += Number(rental.total_price || 0);

        const endDate = new Date(rental.end_date);
        if (
          endDate.getMonth() === currentMonth &&
          endDate.getFullYear() === currentYear
        ) {
          thisMonth += Number(rental.total_price || 0);
        }
      }
    });

    return { totalAllTime: allTime, totalThisMonth: thisMonth };
  }, [rentals]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.accent}
          style={styles.icon}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("stats.this_month", "За этот месяц")}
        </Text>
        <Text
          style={[styles.amount, { color: colors.textPrimary }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatMoney(totalThisMonth)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Ionicons
          name="wallet-outline"
          size={20}
          color={colors.success}
          style={styles.icon}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("stats.all_time", "За всё время")}
        </Text>
        <Text
          style={[styles.amount, { color: colors.textPrimary }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatMoney(totalAllTime)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  icon: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  amount: {
    fontSize: 22,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
