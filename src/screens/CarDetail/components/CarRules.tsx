import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { CarSpecRow } from "./CarSpecRow";

interface CarRulesProps {
  car: any;
}

export const CarRules: React.FC<CarRulesProps> = ({ car }) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {t("car_detail.rules_title", "Правила аренды")}
      </Text>
      <CarSpecRow
        label={t("car_detail.mileage_limit", "Включенный пробег")}
        value={`${car.mileage_limit_per_day} ${t("car_detail.km_per_day", "км / сутки")}`}
      />
      <CarSpecRow
        label={t("car_detail.over_limit", "Перепробег")}
        value={`${car.price_per_km_over_limit} ${t("car_detail.rub_per_km", "₽ / км")}`}
      />
      <CarSpecRow
        label={t("car_detail.min_age_label", "Минимальный возраст")}
        value={`${car.min_age} ${t("car_detail.years_suffix", "год(а)")}`}
      />
      <CarSpecRow
        label={t("car_detail.insurance_label", "Страховка")}
        value={car.insurance_type}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, borderRadius: 24 },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
});
