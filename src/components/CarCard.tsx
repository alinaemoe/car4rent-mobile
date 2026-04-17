import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Car } from "../types";

import { useAppDispatch, useAppSelector } from "@/src/store";
import {
  selectIsCarFavorite,
  toggleFavoriteThunk,
} from "@/src/store/slices/favoritesSlice";

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export const CarCard = ({ car, onPress }: CarCardProps) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isFavorite = useAppSelector((state) =>
    selectIsCarFavorite(state, car.id),
  );

  const mainImage =
    car.images?.find((img) => img.is_main)?.url ||
    "https://via.placeholder.com/400x200?text=No+Image";

  const handleLikePress = () => {
    dispatch(toggleFavoriteThunk(car.id));
  };

  // Генератор звездочек (5 штук)
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <Ionicons key={i} name="star" size={12} color={colors.warning} />,
        );
      } else if (rating >= i - 0.5) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={12}
            color={colors.warning}
          />,
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={12}
            color={colors.warning}
          />,
        );
      }
    }
    return stars;
  };

  const avgRating = car.avg_rating ? Number(car.avg_rating) : 0;
  const reviewsCount = car.reviews_count || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View>
        <Image
          style={styles.image}
          source={mainImage}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={300}
        />

        {/* 👈 БЕЙДЖ РЕЙТИНГА (Слева сверху) */}
        {reviewsCount > 0 && (
          <View style={styles.ratingBadge}>
            <View style={styles.starsRow}>{renderStars(avgRating)}</View>
            <Text style={styles.ratingText}>
              {avgRating.toFixed(1)}{" "}
              <Text style={styles.reviewsCount}>({reviewsCount})</Text>
            </Text>
          </View>
        )}

        {/* НОВЫЙ АВТО (Если нет отзывов) */}
        {reviewsCount === 0 && (
          <View
            style={[styles.ratingBadge, { backgroundColor: colors.successBg }]}
          >
            <Text
              style={[
                styles.ratingText,
                { color: colors.success, marginLeft: 0 },
              ]}
            >
              NEW
            </Text>
          </View>
        )}

        {/* 👈 КНОПКА ЛАЙКА (Справа сверху) */}
        <TouchableOpacity
          style={[
            styles.likeButton,
            { backgroundColor: colors.surfaceTransparent },
          ]}
          onPress={handleLikePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? colors.error : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        {/* ХЕДЕР: Марка, Модель, Год и Цена */}
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {car.brand} {car.model}{" "}
            <Text
              style={{
                fontWeight: "400",
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {car.year}
            </Text>
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.price, { color: colors.success }]}>
              {car.price_per_day} ₽
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginTop: -2,
              }}
            >
              / {t("day", "сутки")}
            </Text>
          </View>
        </View>

        {/* ХАРАКТЕРИСТИКИ (Бейджи с иконками) */}
        <View style={styles.badgesRow}>
          {/* Коробка */}
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <Ionicons
              name="settings-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
              {t(
                `transmission_${car.transmission.toLowerCase()}`,
                car.transmission,
              )}
            </Text>
          </View>

          {/* Топливо */}
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <Ionicons
              name="water-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
              {t(`fuel_${car.fuel_type.toLowerCase()}`, car.fuel_type)}
            </Text>
          </View>

          {/* Привод (если есть) */}
          {car.drive_type && (
            <View
              style={[styles.badge, { backgroundColor: colors.background }]}
            >
              <Ionicons
                name="car-sport-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                {car.drive_type}
              </Text>
            </View>
          )}

          {/* Мощность (если есть) */}
          {car.horsepower && (
            <View
              style={[styles.badge, { backgroundColor: colors.background }]}
            >
              <Ionicons
                name="speedometer-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                {car.horsepower} л.с.
              </Text>
            </View>
          )}
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
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 190,
    backgroundColor: "#e1e4e8",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    // Эффект блюра на iOS (опционально, если будешь использовать expo-blur)
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
    gap: 1,
  },
  ratingText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  reviewsCount: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "normal",
    fontSize: 12,
  },
  likeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  infoContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap", // Разрешаем перенос на новую строку
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4, // Расстояние между иконкой и текстом
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
