import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface CarHighlightsProps {
  depositAmount: number;
}

export const CarHighlights: React.FC<CarHighlightsProps> = ({
  depositAmount,
}) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      {depositAmount === 0 && (
        <View style={styles.highlightRow}>
          <View
            style={[styles.highlightIcon, { backgroundColor: colors.accentBg }]}
          >
            <Ionicons name="wallet-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.highlightText}>
            <Text
              style={[styles.highlightTitle, { color: colors.textPrimary }]}
            >
              {t("car_detail.no_deposit", "Аренда без залога")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {t(
                "car_detail.no_deposit_desc",
                "Вам не нужно замораживать деньги на карте.",
              )}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.highlightRow}>
        <View
          style={[styles.highlightIcon, { backgroundColor: colors.accentBg }]}
        >
          <Ionicons name="star-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.highlightText}>
          <Text style={[styles.highlightTitle, { color: colors.textPrimary }]}>
            {t("car_detail.long_trips", "Идеально для долгих поездок")}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {t(
              "car_detail.long_trips_desc",
              "100% клиентов высоко оценили комфорт этого авто.",
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, borderRadius: 24 },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  highlightText: { flex: 1 },
  highlightTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
});
