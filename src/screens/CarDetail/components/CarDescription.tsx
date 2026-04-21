import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface CarDescriptionProps {
  descriptionRu?: string;
  descriptionEn?: string;
}

export const CarDescription: React.FC<CarDescriptionProps> = ({
  descriptionRu,
  descriptionEn,
}) => {
  const colors = useAppColors();
  const { t, i18n } = useTranslation();

  const descriptionText =
    i18n.language === "en"
      ? descriptionEn || descriptionRu
      : descriptionRu ||
        descriptionEn ||
        t(
          "car_detail.default_description",
          "Отличный автомобиль в идеальном состоянии. Своевременное ТО.",
        );

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {t("car_detail.description_label", "Описание")}
      </Text>
      <Text style={{ color: colors.textPrimary, fontSize: 15, lineHeight: 24 }}>
        {descriptionText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, borderRadius: 24 },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
});
