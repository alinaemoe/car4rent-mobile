import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Rental } from "@/src/api/queries/useRentals";
import { useRentalTimer } from "./useRentalTimer";

interface Props {
  rental: Rental;
}

export const RentalCardFooter = ({ rental }: Props) => {
  const colors = useAppColors();
  const timeLeft = useRentalTimer(rental.status, rental.end_date);

  const formatDates = () => {
    const start = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };
    return `${start.toLocaleDateString("ru-RU", options)} - ${end.toLocaleDateString("ru-RU", options)}`;
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "";
    return Number(price).toLocaleString("ru-RU") + " Br";
  };

  return (
    <View style={styles.bottomSection}>
      {rental.status === "ACTIVE" ? (
        <View style={styles.timerContainer}>
          <Ionicons
            name="hourglass-outline"
            size={16}
            color={colors.accent}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.timerText, { color: colors.accent }]}>
            Осталось: <Text style={{ fontWeight: "bold" }}>{timeLeft}</Text>
          </Text>
        </View>
      ) : (
        <Text style={[styles.datesText, { color: colors.textSecondary }]}>
          {formatDates()}
        </Text>
      )}

      <Text style={[styles.priceText, { color: colors.textPrimary }]}>
        {formatPrice(rental.total_price || rental.base_price)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datesText: { fontSize: 14, fontWeight: "500" },
  priceText: { fontSize: 16, fontWeight: "800" },
  timerContainer: { flexDirection: "row", alignItems: "center" },
  timerText: { fontSize: 14 },
});
