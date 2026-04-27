import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { CarReviewPreview } from "@/src/types";

interface CarReviewsProps {
  avgRating?: number;
  reviewsCount?: number;
  reviews?: CarReviewPreview[];
  onViewAllPress?: () => void;
}

// Хелпер для рендера звездочек рейтинга (учитывает дробные числа для общего рейтинга)
const renderStars = (rating: number, color: string, size = 16) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Ionicons key={i} name="star" size={size} color={color} />);
    } else if (rating >= i - 0.5) {
      stars.push(
        <Ionicons key={i} name="star-half" size={size} color={color} />,
      );
    } else {
      stars.push(
        <Ionicons key={i} name="star-outline" size={size} color={color} />,
      );
    }
  }
  return <View style={{ flexDirection: "row" }}>{stars}</View>;
};

// Хелпер для красивой даты
const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export const CarReviews: React.FC<CarReviewsProps> = ({
  avgRating = 0,
  reviewsCount = 0,
  reviews = [],
  onViewAllPress,
}) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  // Если отзывов нет вообще — показываем красивую заглушку
  if (reviewsCount === 0 || reviews.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {t("car_detail.reviews_title", "Отзывы и оценки")}
        </Text>
        <Text
          style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}
        >
          {t(
            "car_detail.no_reviews",
            "У этого автомобиля еще нет отзывов. Станьте первым, кто арендует и поделится впечатлениями!",
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {t("car_detail.reviews_title", "Отзывы и оценки")}
      </Text>

      {/* Шапка рейтинга (например: 4.8 и 5 звезд) */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: colors.warning,
            marginRight: 12,
          }}
        >
          {Number(avgRating).toFixed(1)}
        </Text>
        <View>
          {renderStars(avgRating, colors.warning, 20)}
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}
          >
            {t("car_detail.based_on", "На основе")} {reviewsCount}{" "}
            {t("car_detail.reviews_count_label", "отзывов")}
          </Text>
        </View>
      </View>

      {/* Список последних отзывов (до 3 штук) */}
      {reviews.map((review, index) => {
        // Достаем первую букву имени для аватара
        const initial = review.userFirstName
          ? review.userFirstName.charAt(0).toUpperCase()
          : "U";

        return (
          <View
            key={review.id}
            style={{
              borderBottomColor: colors.border,
              borderBottomWidth: index === reviews.length - 1 ? 0 : 1, // Не рисуем линию у последнего
              paddingBottom: 16,
              marginBottom: index === reviews.length - 1 ? 0 : 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {/* Аватарка */}
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                >
                  {initial}
                </Text>
              </View>

              {/* Имя и Дата */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: colors.textPrimary,
                    fontSize: 16,
                  }}
                >
                  {review.userFirstName} {review.userLastName}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  {renderStars(review.rating, colors.warning, 12)}
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginLeft: 8,
                    }}
                  >
                    {formatDate(review.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Текст отзыва */}
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              {review.comment}
            </Text>
          </View>
        );
      })}

      {/* Кнопка "Смотреть все", если отзывов больше, чем мы отрендерили (3) */}
      {reviewsCount > reviews.length && (
        <TouchableOpacity
          style={{ marginTop: 20, alignItems: "center", paddingVertical: 8 }}
          onPress={onViewAllPress}
        >
          <Text
            style={{ color: colors.accent, fontSize: 16, fontWeight: "bold" }}
          >
            {t("car_detail.view_all_reviews", "Смотреть все отзывы")} (
            {reviewsCount})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, borderRadius: 24 },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
});
