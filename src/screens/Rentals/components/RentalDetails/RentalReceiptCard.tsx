import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Rental } from "@/src/api/queries/useRentals";

interface Props {
  rental: Rental;
}

export const RentalReceiptCard = ({ rental }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  const formatPrice = (price: string | number | null) => {
    if (!price) return "0 Br";
    return Number(price).toLocaleString("ru-RU") + " Br";
  };

  const deposit = Number(rental.car.id || 0); //TODO
  const basePrice = Number(rental.base_price || 0);
  const penalty = Number(rental.penalty_price || 0);
  const total = Number(rental.total_price || basePrice);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Детали оплаты
      </Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Стоимость аренды
        </Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>
          {formatPrice(basePrice)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Возвратный залог
        </Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>
          {formatPrice(deposit)}
        </Text>
      </View>

      {penalty > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.error }]}>
            Штрафы / Перерасход
          </Text>
          <Text style={[styles.value, { color: colors.error }]}>
            + {formatPrice(penalty)}
          </Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
          Итого к оплате
        </Text>
        <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
          {formatPrice(total)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, borderRadius: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { fontSize: 15 },
  value: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 20, fontWeight: "900" },
});
