import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

export const CheckoutMiniCar = ({ car }: { car: any }) => {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.miniCardContent}>
        <Image
          source={car.images?.[0]?.url || "https://via.placeholder.com/150"}
          style={styles.miniImage}
          placeholder={{ blurhash }}
          contentFit="cover"
        />
        <View style={styles.miniInfo}>
          <Text
            style={[styles.miniTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {car.brand} {car.model}, {car.year}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontWeight: "bold",
                color: colors.warning,
                fontSize: 14,
              }}
            >
              {car.avg_rating || "5.0"}{" "}
            </Text>
            <Ionicons
              name="star"
              size={12}
              color={colors.warning}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.miniRating, { color: colors.textSecondary }]}>
              {car.reviews_count || 0} {t("checkout.reviews_count", "отзывов")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // Легкая тень, чтобы блок машины парил над серым фоном
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  miniCardContent: { flexDirection: "row", alignItems: "center" },
  miniImage: {
    width: 86,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e1e4e8",
  },
  miniInfo: { marginLeft: 16, flex: 1 },
  miniTitle: { fontSize: 17, fontWeight: "500", marginBottom: 4 },
  miniRating: { fontSize: 14 },
});
