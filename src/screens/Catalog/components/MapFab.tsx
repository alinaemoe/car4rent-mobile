import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

export const MapFab = () => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.mapFab, { backgroundColor: colors.accent }]}
      activeOpacity={0.9}
    >
      <Text style={styles.mapFabText}>{t("map", "Карта")}</Text>
      <Ionicons name="map-outline" size={20} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mapFab: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  mapFabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
});
