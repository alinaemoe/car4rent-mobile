import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  isMapView: boolean;
  onToggle: () => void;
}

export const MapFab = ({ isMapView, onToggle }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.mapFab, { backgroundColor: colors.accent }]}
      activeOpacity={0.9}
      onPress={onToggle}
    >
      <Text style={styles.mapFabText}>
        {isMapView ? t("list", "Список") : t("map", "Карта")}
      </Text>
      <Ionicons
        name={isMapView ? "list-outline" : "map-outline"}
        size={20}
        color="#fff"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mapFab: {
    position: "absolute",
    bottom: 24, // Чуть приподняли
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mapFabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
});
