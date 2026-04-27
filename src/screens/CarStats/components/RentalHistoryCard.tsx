import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { CarRentalHistoryItem } from "@/src/api/queries/useCarRentalsHistory";

interface Props {
  rental: CarRentalHistoryItem;
}

export const RentalHistoryCard = ({ rental }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));

  const getStatusColor = () => {
    switch (rental.status) {
      case "COMPLETED":
        return colors.textSecondary;
      case "ACTIVE":
        return colors.success;
      case "CANCELED":
      case "REJECTED":
        return colors.error;
      default:
        return colors.accent;
    }
  };

  const clientName = rental.user
    ? `${rental.user.first_name} ${rental.user.last_name || ""}`.trim()
    : t("stats.unknown_client", "Клиент");
  const clientInitial = rental.user?.first_name
    ? rental.user.first_name.charAt(0).toUpperCase()
    : "?";

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.clientInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.border }]}>
            <Text style={[styles.avatarText, { color: colors.textPrimary }]}>
              {clientInitial}
            </Text>
          </View>
          <View>
            <Text style={[styles.clientName, { color: colors.textPrimary }]}>
              {clientName}
            </Text>
            {!!rental.user?.phone && (
              <Text style={[styles.phone, { color: colors.textSecondary }]}>
                {rental.user.phone}
              </Text>
            )}
          </View>
        </View>
        <Text style={[styles.price, { color: colors.textPrimary }]}>
          {rental.total_price} ₽
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footer}>
        <View style={styles.dates}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(rental.start_date)} — {formatDate(rental.end_date)}
          </Text>
        </View>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {t(`status.${rental.status.toLowerCase()}`, rental.status)}
        </Text>
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
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  clientName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  phone: {
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
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
  dates: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
