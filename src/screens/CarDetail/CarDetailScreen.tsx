import React, { useRef } from "react";
import { View, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { useCarDetail } from "@/src/api/queries/useCars";
import { usePriceCalculator } from "@/src/hooks/usePriceCalculator";
import { selectIsCarFavorite } from "@/src/store/slices/favoritesSlice";

import { CalendarSheet } from "@/src/screens/Catalog/modals/CalendarSheet";
import { StickyFooter } from "@/src/screens/CarDetail/components/StickyFooter";

// Импорт компонентов
import { CarCarousel } from "./components/CarCarousel";
import { CarHighlights } from "./components/CarHighlights";
import { CarDiscounts } from "./components/CarDiscounts";
import { CarDescription } from "./components/CarDescription";
import { CarSpecs } from "./components/CarSpecs";
import { CarLocation } from "./components/CarLocation";
import { CarRules } from "./components/CarRules";
import { CarReviews } from "./components/CarReviews";
import { CarHowItWorks } from "./components/CarHowItWorks";

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();

  const { startDate, endDate } = useAppSelector((state) => state.filters);
  const isGuest = useAppSelector((state) => state.auth?.isGuest ?? false);
  const isVerified = useAppSelector(
    (state) => state.auth?.user?.status === "ACTIVE",
  );

  const { data: car, isLoading } = useCarDetail(Number(id));
  const { days, finalRentPrice } = usePriceCalculator(car, startDate, endDate);

  const calendarSheetRef = useRef<any>(null);

  const handleBookPress = () => {
    if (!startDate || !endDate) {
      calendarSheetRef.current?.present();
      return;
    }
    if (isGuest) {
      Alert.alert(
        t("car_detail.login_alert_title", "Войдите в аккаунт"),
        t(
          "car_detail.login_alert_msg",
          "Для бронирования автомобиля необходимо войти.",
        ),
        [
          { text: t("common.cancel", "Отмена"), style: "cancel" },
          {
            text: t("common.login", "Войти"),
            onPress: () => router.push("/login" as Href),
          },
        ],
      );
      return;
    }
    if (!isVerified) {
      Alert.alert(
        t("car_detail.docs_alert_title", "Загрузите документы"),
        t(
          "car_detail.docs_alert_msg",
          "Сначала нам нужно проверить ваши права в профиле.",
        ),
        [
          { text: t("common.later", "Позже"), style: "cancel" },
          {
            text: t("common.to_profile", "В профиль"),
            onPress: () => router.push("/profile" as Href),
          },
        ],
      );
      return;
    }
    router.push({ pathname: "/checkout/[id]", params: { id: car.id } });
  };

  if (isLoading || !car)
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <CarCarousel images={car.images} />

        <View
          style={[styles.headerCard, { backgroundColor: colors.background }]}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: colors.textPrimary,
              marginBottom: 8,
            }}
          >
            {car.brand} {car.model}, {car.year}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="star"
              size={16}
              color={colors.warning}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "bold",
                color: colors.warning,
              }}
            >
              {car.avg_rating || "5.0"}
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                marginLeft: 8,
              }}
            >
              {car.reviews_count || 0}{" "}
              {t("car_detail.reviews_count_label", "отзывов")}
            </Text>
          </View>
        </View>

        <CarHighlights depositAmount={car.deposit_amount} />
        <CarDiscounts
          discountTiers={car.discount_tiers}
          pricePerDay={car.price_per_day}
        />
        <CarDescription
          descriptionRu={car?.description?.ru}
          descriptionEn={car?.description?.en}
        />
        <CarSpecs car={car} />
        <CarLocation />
        <CarRules car={car} />
        <CarReviews avgRating={car.avg_rating} />
        <CarHowItWorks />
      </ScrollView>

      <StickyFooter
        pricePerDay={car.price_per_day}
        days={days}
        finalRentPrice={finalRentPrice}
        startDate={startDate}
        onBookPress={handleBookPress}
      />
      <CalendarSheet
        ref={calendarSheetRef}
        markedDates={{}}
        onDayPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: 20,
    marginBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
