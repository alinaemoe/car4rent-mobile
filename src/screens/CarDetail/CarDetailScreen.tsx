import React, { useRef, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { useCarDetail } from "@/src/api/queries/useCars";
import { usePriceCalculator } from "@/src/hooks/usePriceCalculator";
import { selectIsCarFavorite } from "@/src/store/slices/favoritesSlice";
import { applyFilters } from "@/src/store/slices/filtersSlice";

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
import { CarFaq } from "./components/CarFaq";

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { startDate, endDate } = useAppSelector((state) => state.filters);
  const isGuest = useAppSelector((state) => state.auth?.isGuest ?? false);
  const isVerified = useAppSelector(
    (state) => state.auth?.user?.status === "ACTIVE",
  );

  const { data: car, isLoading } = useCarDetail(Number(id));
  const { days, finalRentPrice } = usePriceCalculator(car, startDate, endDate);

  const calendarSheetRef = useRef<any>(null);

  const [markedDates, setMarkedDates] = useState<any>({});
  const [tempStart, setTempStart] = useState<string | null>(startDate || null);

  useEffect(() => {
    if (startDate && endDate) {
      let newMarked: any = {
        [startDate]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
        [endDate]: {
          endingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      };

      let curr = new Date(startDate);
      curr.setDate(curr.getDate() + 1);
      const end = new Date(endDate);

      while (curr < end) {
        const dateStr = curr.toISOString().split("T")[0];
        newMarked[dateStr] = {
          color: colors.surface,
          textColor: colors.textPrimary,
        };
        curr.setDate(curr.getDate() + 1);
      }

      setMarkedDates(newMarked);
      setTempStart(startDate);
    } else if (startDate && !endDate) {
      setMarkedDates({
        [startDate]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      });
      setTempStart(startDate);
    } else {
      setMarkedDates({});
      setTempStart(null);
    }
  }, [startDate, endDate, colors]);

  const handleDayPress = (day: any) => {
    const dateString = day.dateString;

    if (!tempStart || (startDate && endDate)) {
      setTempStart(dateString);
      dispatch(applyFilters({ startDate: dateString, endDate: null }));
      setMarkedDates({
        [dateString]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      });
    } else if (tempStart && !endDate) {
      if (new Date(dateString) < new Date(tempStart)) {
        setTempStart(dateString);
        dispatch(applyFilters({ startDate: dateString, endDate: null }));
        setMarkedDates({
          [dateString]: {
            startingDay: true,
            color: colors.accent,
            textColor: "white",
          },
        });
        return;
      }

      dispatch(applyFilters({ endDate: dateString }));
      let newMarked: any = {
        [tempStart]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
        [dateString]: {
          endingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      };

      let curr = new Date(tempStart);
      curr.setDate(curr.getDate() + 1);
      const end = new Date(dateString);

      // Закрашиваем все дни между стартом и концом
      while (curr < end) {
        const dateStr = curr.toISOString().split("T")[0];
        newMarked[dateStr] = {
          color: colors.surface, // Либо используй accentBg для легкого фона
          textColor: colors.textPrimary,
        };
        curr.setDate(curr.getDate() + 1);
      }

      setMarkedDates(newMarked);
      // Закрываем шторку с небольшой задержкой для красоты
      setTimeout(() => calendarSheetRef.current?.dismiss(), 500);
    }
  };
  const handleClearDates = () => {
    // 1. Очищаем локальные стейты календаря
    setTempStart(null);
    setMarkedDates({});

    // 2. Затираем даты в Redux (применяем null)
    dispatch(applyFilters({ startDate: null, endDate: null }));

    // 3. Закрываем шторку
    calendarSheetRef.current?.dismiss();
  };

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
      <SafeAreaView
        edges={["top"]} // Ограничиваем только верхом, чтобы снизу не было лишнего паддинга
        style={{
          backgroundColor: colors.background,
          zIndex: 10,
          elevation: 5,
          // Вместо отдельного View-разделителя используем границу
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        }}
      >
        <View style={styles.stickyHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-back-outline"
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {car.brand} {car.model}, {car.year}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <CarCarousel images={car.images} />

        {/* КАРТОЧКА 1: ШАПКА (Наезжает на картинку) */}
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
        <CarFaq />
      </ScrollView>

      <StickyFooter
        pricePerDay={car.price_per_day}
        days={days}
        finalRentPrice={finalRentPrice}
        startDate={startDate}
        endDate={endDate} // 👈 ВОТ ЭТУ СТРОЧКУ ОБЯЗАТЕЛЬНО ДОБАВЬ!
        onBookPress={handleBookPress}
      />
      <CalendarSheet
        ref={calendarSheetRef}
        markedDates={markedDates} // 👈 ТЕПЕРЬ ПЕРЕДАЕМ НАШ СТЕЙТ
        onDayPress={handleDayPress} // 👈 И ПЕРЕДАЕМ ФУНКЦИЮ
        onClear={handleClearDates}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Стили для нового хедера
  // Стили для нового хедера
  stickyHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    // Убрали justifyContent: "space-between", теперь всё прижато влево
  },
  backBtn: {
    justifyContent: "center",
    marginRight: 16, // Отступ между стрелкой и текстом
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    // Убрали flex: 1 и textAlign: "center"
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth, // Максимально тонкая линия (1 пиксель устройства)
    marginHorizontal: 20, // Отступы по краям, чтобы линия была чуть уже экрана
    opacity: 0.7, // Делаем линию чуть прозрачнее и неброской
  },

  // Стили для первой карточки (наезд на картинку) остаются без изменений:
  headerCard: {
    padding: 20,
    paddingTop: 24,
    marginBottom: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -24,
    zIndex: 1,
  },
});
