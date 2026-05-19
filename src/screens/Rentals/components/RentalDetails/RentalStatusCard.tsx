import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Rental, RentalStatus } from "@/src/api/queries/useRentals";

interface Props {
  rental: Rental;
}

export const RentalStatusCard = ({ rental }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  const getStatusConfig = (status: RentalStatus) => {
    switch (status) {
      case "CREATED":
        return {
          label: t("status.created", "На рассмотрении"),
          color: colors.warning,
          bg: colors.warningBg,
        };
      case "APPROVED":
        return {
          label: t("status.approved", "Подтверждено"),
          color: colors.success,
          bg: colors.successBg,
        };
      case "ACTIVE":
        return {
          label: t("status.active", "В поездке"),
          color: colors.accent,
          bg: colors.accentBg,
        };
      case "COMPLETED":
        return {
          label: t("status.completed", "Завершена"),
          color: colors.textSecondary,
          bg: colors.border,
        };
      case "CANCELED":
      case "REJECTED":
        return {
          label: t("status.canceled", "Отменена"),
          color: colors.error,
          bg: colors.errorBg,
        };
      default:
        return {
          label: t(`status.${status.toLowerCase()}`, status),
          color: colors.textSecondary,
          bg: colors.border,
        };
    }
  };

  const statusConfig = getStatusConfig(rental.status);
  const showMemo = rental.status === "APPROVED" || rental.status === "CREATED";

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {rental.car.brand} {rental.car.model}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <Text style={[styles.bookingId, { color: colors.textSecondary }]}>
        {t("rental.booking_id", {
          id: rental.id,
          defaultValue: "Бронь #{{id}}",
        })}
      </Text>

      {/* Памятка для предстоящих поездок */}
      {showMemo && (
        <View style={[styles.memoBox, { backgroundColor: colors.warningBg }]}>
          <Ionicons
            name="information-circle"
            size={24}
            color={colors.warning}
            style={styles.memoIcon}
          />
          <Text style={[styles.memoText, { color: colors.textPrimary }]}>
            {t(
              "rental.memo_text",
              "Для получения автомобиля вам понадобятся оригиналы паспорта и водительского удостоверения.",
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24, // Верхние углы не скругляем, так как она прилипает к хедеру
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  bookingId: {
    fontSize: 15,
    marginBottom: 16,
  },
  memoBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  memoIcon: {
    marginRight: 12,
  },
  memoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
