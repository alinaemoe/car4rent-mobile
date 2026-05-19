import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface CarDiscountsProps {
  discountTiers: Record<string, number>;
  pricePerDay: number;
}

export const CarDiscounts: React.FC<CarDiscountsProps> = ({
  discountTiers,
  pricePerDay,
}) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  if (!discountTiers || Object.keys(discountTiers).length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {t("car_detail.discounts_title", "Скидки на аренду")}
        </Text>
        <View
          style={[styles.profitBadge, { backgroundColor: colors.successBg }]}
        >
          <Text
            style={{ color: colors.success, fontSize: 12, fontWeight: "bold" }}
          >
            {t("car_detail.profitable", "Выгодно")}
          </Text>
        </View>
      </View>

      <View style={[styles.discountRow, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
          {t("car_detail.from_days_1", "от 1 суток")}
        </Text>
        <Text
          style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "600" }}
        >
          {pricePerDay} Br{" "}
          <Text style={{ color: colors.textSecondary, fontWeight: "400" }}>
            {t("car_detail.per_day", "/ сутки")}
          </Text>
        </Text>
      </View>

      {Object.entries(discountTiers)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([daysReq, discount], idx) => {
          const discPrice = Math.floor(
            pricePerDay - (pricePerDay * Number(discount)) / 100,
          );
          return (
            <View
              key={idx}
              style={[styles.discountRow, { backgroundColor: colors.surface }]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
                  {t("car_detail.from_days_n", {
                    defaultValue: `от ${daysReq} суток`,
                    count: Number(daysReq),
                  })}
                </Text>
                <View
                  style={[
                    styles.discountPercent,
                    { backgroundColor: colors.errorBg },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.error,
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    -{Number(discount)}%
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {discPrice} Br{" "}
                <Text
                  style={{ color: colors.textSecondary, fontWeight: "400" }}
                >
                  {t("car_detail.per_day", "/ сутки")}
                </Text>
              </Text>
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, borderRadius: 24 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold" },
  profitBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  discountPercent: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
