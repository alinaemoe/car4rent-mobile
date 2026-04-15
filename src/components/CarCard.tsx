import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useTranslation } from "react-i18next";
import { Car } from "../types";

// Хэш-заглушка (красивое размытие), пока грузится реальное фото
const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export const CarCard = ({ car, onPress }: CarCardProps) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  // Достаем главную картинку. Если ее нет — ставим заглушку.
  const mainImage =
    car.images?.find((img) => img.is_main)?.url ||
    "https://via.placeholder.com/400x200?text=No+Image";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Image
        style={styles.image}
        source={mainImage}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={300} // Плавное появление
      />

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {car.brand} {car.model}{" "}
            <Text style={{ fontWeight: "400", fontSize: 14 }}>
              ({car.year})
            </Text>
          </Text>
          <Text style={[styles.price, { color: colors.success }]}>
            ${car.price_per_day}{" "}
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              / {t("day", "день")}
            </Text>
          </Text>
        </View>

        {/* Бейджи характеристик */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {t(
                `transmission_${car.transmission.toLowerCase()}`,
                car.transmission,
              )}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {t(`fuel_${car.fuel_type.toLowerCase()}`, car.fuel_type)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden", // Чтобы картинка не вылезала за скругленные углы
    elevation: 3, // Тень на Android
    shadowColor: "#000", // Тень на iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#e1e4e8", // Цвет фона пока грузится
  },
  infoContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1, // Чтобы длинное название не толкало цену за экран
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
