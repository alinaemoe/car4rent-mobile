import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Rental, RentalStatus } from "@/src/api/queries/useRentals";

interface Props {
  rental: Rental;
}

export const RentalCardHeader = ({ rental }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  const mainImage =
    rental.car.images?.find((img) => img.is_main)?.url ||
    rental.car.images?.[0]?.url;

  const showLicensePlate = !!rental.car.license_plate;

  const getStatusConfig = (status: RentalStatus) => {
    switch (status) {
      case "CREATED":
        return {
          label: t("status.created", "На рассмотрении"),
          color: colors.warning,
          bg: colors.warningBg,
        };
      case "APPROVED":
        return {
          label: t("status.approved", "Подтверждено"),
          color: colors.success,
          bg: colors.successBg,
        };
      case "ACTIVE":
        return {
          label: t("status.active", "В поездке"),
          color: colors.accent,
          bg: colors.accentBg,
        };
      case "COMPLETED":
        return {
          label: t("status.completed", "Завершена"),
          color: colors.textSecondary,
          bg: colors.surfaceTransparent,
        };
      case "CANCELED":
      case "REJECTED":
        return {
          label: t("status.canceled", "Отменена"),
          color: colors.error,
          bg: colors.errorBg,
        };
      default:
        return {
          label: status,
          color: colors.textSecondary,
          bg: colors.border,
        };
    }
  };

  const statusConfig = getStatusConfig(rental.status);

  return (
    <View style={styles.topSection}>
      <Image
        source={{ uri: mainImage }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.infoRight}>
        <View style={{ alignSelf: "flex-start", marginBottom: 6 }}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <View style={styles.nameContainer}>
            <ScrollView
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
            >
              <Text style={[styles.carName, { color: colors.textPrimary }]}>
                {rental.car.brand} {rental.car.model}
              </Text>
            </ScrollView>
            <LinearGradient
              colors={["transparent", colors.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fadeOverlay}
              pointerEvents="none"
            />
          </View>

          <Text style={[styles.yearText, { color: colors.textSecondary }]}>
            {rental.car.year}
          </Text>

          {showLicensePlate && (
            <View
              style={[styles.licenseBadge, { backgroundColor: colors.border }]}
            >
              <Text style={[styles.licenseText, { color: colors.textPrimary }]}>
                {rental.car.license_plate}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: { flexDirection: "row", alignItems: "center" },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    backgroundColor: "#e0e0e0",
  },
  infoRight: { flex: 1, justifyContent: "center" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    width: "100%",
  },
  nameContainer: {
    flex: 1,
    position: "relative",
    marginRight: 8,
    overflow: "hidden",
  },
  carName: { fontSize: 14, fontWeight: "bold" },
  fadeOverlay: { position: "absolute", right: 0, top: 0, bottom: 0, width: 32 },
  yearText: { fontSize: 14, fontWeight: "600", marginRight: 8, flexShrink: 0 },
  licenseBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  licenseText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
});
