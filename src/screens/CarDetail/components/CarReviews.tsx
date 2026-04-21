import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface CarReviewsProps {
  avgRating: string | number;
}

export const CarReviews: React.FC<CarReviewsProps> = ({ avgRating }) => {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {t("car_detail.reviews_title", "Отзывы и оценки")}
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: colors.warning,
            marginRight: 8,
          }}
        >
          {avgRating || "5.0"}
        </Text>
        <View style={{ flexDirection: "row" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons key={i} name="star" size={16} color={colors.warning} />
          ))}
        </View>
      </View>
      <View
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingBottom: 16,
          marginBottom: 16,
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
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              А
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontWeight: "bold",
                color: colors.textPrimary,
                fontSize: 16,
              }}
            >
              {t("car_detail.stub_user_name", "Алексей Смирнов")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              12 мая 2025
            </Text>
          </View>
        </View>
        <Text
          style={{ color: colors.textPrimary, fontSize: 15, lineHeight: 22 }}
        >
          {t(
            "car_detail.stub_review_text",
            "Машина в отличном техническом состоянии. Передача прошла быстро, арендодатель вежливый. Рекомендую!",
          )}
        </Text>
      </View>
      <TouchableOpacity>
        <Text
          style={{ color: colors.accent, fontSize: 16, fontWeight: "bold" }}
        >
          {t("car_detail.view_all_reviews", "Смотреть все отзывы")}
        </Text>
      </TouchableOpacity>
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
