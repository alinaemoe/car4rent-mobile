import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export const CarLocation: React.FC = () => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.mapPlaceholder}>
        <Ionicons
          name="location-outline"
          size={40}
          color="#fff"
          style={{ marginBottom: 12 }}
        />
        <Text
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          {t("car_detail.location_label", "Местоположение автомобиля")}
        </Text>
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {t("car_detail.location_stub", "Россия, Москва, Район выдачи авто")}
        </Text>
        <TouchableOpacity style={styles.mapBtn}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {t("car_detail.view_on_map", "Смотреть на карте")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 0, marginBottom: 12, borderRadius: 24, overflow: "hidden" },
  mapPlaceholder: {
    backgroundColor: "#4a5568",
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
