import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  days: number;
  baseTotal: number;
  discountAmount: number;
  finalRentPrice: number;
  deposit: number;
  discountTiers?: Record<string, number> | null;
}

export const CheckoutSummary = ({
  days,
  baseTotal,
  discountAmount,
  finalRentPrice,
  deposit,
  discountTiers,
}: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  const minDiscountDays = discountTiers ? Object.keys(discountTiers)[0] : 3;

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.priceHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
            {t("checkout.rent_cost", "Стоимость аренды")}
          </Text>
          <Ionicons
            name="chevron-up"
            size={18}
            color={colors.textPrimary}
            style={{ marginLeft: 8 }}
          />
        </View>
        <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
          {finalRentPrice} ₽
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
          Аренда {days} сут.
        </Text>
        <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
          {baseTotal} ₽
        </Text>
      </View>

      {discountAmount > 0 ? (
        <View style={styles.priceRow}>
          <Text style={{ color: colors.error, fontSize: 15 }}>
            Скидка на аренду от {minDiscountDays} дней
          </Text>
          <Text style={{ color: colors.error, fontSize: 15 }}>
            -{discountAmount} ₽
          </Text>
        </View>
      ) : null}

      <View style={[styles.priceHeader, { marginTop: 12, marginBottom: 0 }]}>
        <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
          {t("checkout.deposit", "Депозит")}
        </Text>
        <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
          {deposit > 0
            ? `${deposit} ₽`
            : t("checkout.no_deposit", "Без залога")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceTitle: { fontSize: 18, fontWeight: "bold" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});
