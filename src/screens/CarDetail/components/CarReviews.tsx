import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { CarReviewPreview } from "@/src/types";
import { Skeleton } from "@/src/components/common/Skeleton"; // 👈 Твои шикарные скелетоны

interface CarReviewsProps {
  avgRating?: number;
  reviewsCount?: number;
  reviews?: CarReviewPreview[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

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
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  const colors = useAppColors();
  const { t } = useTranslation();

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

      {/* РЕНДЕР ВСЕХ ЗАГРУЖЕННЫХ ОТЗЫВОВ */}
      {reviews.map((review, index) => {
        const initial = review.userFirstName
          ? review.userFirstName.charAt(0).toUpperCase()
          : "U";

        return (
          <View
            key={review.id}
            style={{
              borderBottomColor: colors.border,
              borderBottomWidth:
                index === reviews.length - 1 && !hasNextPage ? 0 : 1,
              paddingBottom: 16,
              marginBottom:
                index === reviews.length - 1 && !hasNextPage ? 0 : 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                >
                  {initial}
                </Text>
              </View>
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

      {/* 💎 СКЕЛЕТОНЫ ПОДГРУЗКИ */}
      {isFetchingNextPage && (
        <View style={{ marginTop: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Skeleton style={styles.avatar} borderRadius={20} />
            <View>
              <Skeleton style={{ width: 120, height: 16, marginBottom: 4 }} />
              <Skeleton style={{ width: 80, height: 12 }} />
            </View>
          </View>
          <Skeleton style={{ width: "100%", height: 40, borderRadius: 8 }} />
        </View>
      )}

      {/* КНОПКА "БОЛЬШЕ ОТЗЫВОВ" */}
      {hasNextPage && !isFetchingNextPage && (
        <TouchableOpacity
          style={{
            marginTop: 12,
            alignItems: "center",
            paddingVertical: 12,
            backgroundColor: colors.surface,
            borderRadius: 12,
          }}
          onPress={fetchNextPage}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            {t("car_detail.load_more_reviews", "Больше отзывов")}
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
