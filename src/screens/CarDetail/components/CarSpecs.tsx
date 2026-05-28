import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { CarSpecRow } from "./CarSpecRow";

interface CarSpecsProps {
  car: any;
}

export const CarSpecs: React.FC<CarSpecsProps> = ({ car }) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {t("car_detail.specs_title", "Характеристики автомобиля")}
      </Text>
      <CarSpecRow
        label={t("car_detail.engine", "Двигатель")}
        value={
          car.horsepower != null
            ? `${car.fuel_type}, ${car.horsepower} ${t("car_detail.hp", "л.с.")}`
            : car.fuel_type
        }
      />
      <CarSpecRow
        label={t("car_detail.drive_type", "Привод")}
        value={car.drive_type}
      />
      <CarSpecRow label={t("car_detail.year_label", "Год")} value={car.year} />
      <CarSpecRow
        label={t("car_detail.transmission", "Коробка")}
        value={car.transmission}
      />
      <CarSpecRow
        label={t("car_detail.body_type", "Кузов")}
        value={car.body_type}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, borderRadius: 24 },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
});
