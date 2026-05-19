import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { TransactionHistoryItem } from "@/src/api/queries/useLessorFinances";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  transaction: TransactionHistoryItem;
}

export const TransactionCard = ({ transaction }: Props) => {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();

  const isPaid = transaction.payout_status === "PAID";
  const statusConfig = isPaid
    ? {
        label: t("finance.paid", "Выплачено"),
        color: colors.success,
        bg: colors.successBg,
      }
    : {
        label: t("finance.pending", "Ожидает выплаты"),
        color: colors.warningText || colors.warning,
        bg: colors.warningBg,
      };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat(i18n.language || "ru", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(i18n.language || "ru", {
      style: "currency",
      currency: "BYN",
      maximumFractionDigits: 0,
    }).format(amount);

  // Имитация разбивки (Если бэкенд отдает штраф в объекте rental)
  // Для примера: если есть пенальти, мы выделяем его из общей lessor_income
  const hasPenalty =
    transaction.rental?.penalty_price && transaction.rental.penalty_price > 0;
  // Доля партнера от штрафа (например, 100%, либо можно сделать 80%)
  const penaltyIncome = hasPenalty ? transaction.rental!.penalty_price! : 0;
  const baseIncome = transaction.lessor_income - penaltyIncome;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Шапка карточки: Авто и Дата */}
      <View style={styles.header}>
        <View style={styles.carInfo}>
          <View
            style={[styles.iconBox, { backgroundColor: colors.background }]}
          >
            <Ionicons name="car-outline" size={18} color={colors.textPrimary} />
          </View>
          <View>
            <Text style={[styles.carName, { color: colors.textPrimary }]}>
              {transaction.car
                ? `${transaction.car.brand} ${transaction.car.model}`
                : t("finance.unknown_car", "Автомобиль")}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(transaction.created_at)}
            </Text>
          </View>
        </View>

        <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
          +{formatMoney(transaction.lessor_income)}
        </Text>
      </View>

      {/* Разбивка (показываем только если есть штраф или доп. услуги) */}
      {hasPenalty && (
        <View
          style={[styles.breakdown, { backgroundColor: colors.background }]}
        >
          <View style={styles.breakdownRow}>
            <Text
              style={[styles.breakdownLabel, { color: colors.textSecondary }]}
            >
              {t("finance.base_rent", "Аренда")}:
            </Text>
            <Text
              style={[styles.breakdownValue, { color: colors.textPrimary }]}
            >
              {formatMoney(baseIncome)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text
              style={[styles.breakdownLabel, { color: colors.textSecondary }]}
            >
              {t("finance.penalty", "Штраф за перепробег")}:
            </Text>
            <Text
              style={[styles.breakdownValue, { color: colors.textPrimary }]}
            >
              {formatMoney(penaltyIncome)}
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Футер: Статус выплаты */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {t("finance.payout_status", "Статус перевода")}:
        </Text>
        <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
          {isPaid ? (
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={statusConfig.color}
              style={{ marginRight: 4 }}
            />
          ) : (
            <Ionicons
              name="time"
              size={14}
              color={statusConfig.color}
              style={{ marginRight: 4 }}
            />
          )}
          <Text style={[styles.badgeText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  carInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  carName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  breakdown: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
