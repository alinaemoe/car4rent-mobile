import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { MyCar } from "@/src/api/queries/useLessorCars";

interface Props {
  car: MyCar;
}

export const CarHeaderInfo = ({ car }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  const mainImage =
    car.images?.find((img) => img.is_main)?.url || car.images?.[0]?.url;

  const getStatusConfig = () => {
    switch (car.status) {
      case "AVAILABLE":
        return {
          label: t("fleet.status.available", "Доступна"),
          color: colors.success,
          bg: colors.successBg,
        };
      case "RENTED":
        return {
          label: t("fleet.status.rented", "В поездке"),
          color: colors.warningText || colors.warning,
          bg: colors.warningBg,
        };
      case "MAINTENANCE":
      default:
        return {
          label: t("fleet.status.hidden", "Скрыта"),
          color: colors.textSecondary,
          bg: colors.border,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Image
        source={{ uri: mainImage }}
        style={[styles.image, { backgroundColor: colors.skeleton }]}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {car.brand} {car.model}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.year, { color: colors.textSecondary }]}>
            {car.year}
          </Text>
          {!!car.license_plate && (
            <View
              style={[styles.plateBadge, { backgroundColor: colors.border }]}
            >
              <Text style={[styles.plateText, { color: colors.textPrimary }]}>
                {car.license_plate}
              </Text>
            </View>
          )}
        </View>
        <View style={{ alignSelf: "flex-start", marginTop: 8 }}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 16,
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  year: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 10,
  },
  plateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  plateText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
