import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { useCarDetail } from "@/src/api/queries/useCars";
import { usePriceCalculator } from "@/src/hooks/usePriceCalculator";
import {
  selectIsCarFavorite,
  toggleFavoriteThunk,
} from "@/src/store/slices/favoritesSlice";

import { CalendarSheet } from "@/src/screens/Catalog/modals/CalendarSheet";
import { StickyFooter } from "@/src/screens/CarDetail/components/StickyFooter";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

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
  const isFavorite = useAppSelector((state) =>
    selectIsCarFavorite(state, Number(id)),
  );

  const { data: car, isLoading } = useCarDetail(Number(id));
  const { days, finalRentPrice } = usePriceCalculator(car, startDate, endDate);

  const calendarSheetRef = useRef<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleBookPress = () => {
    if (!startDate || !endDate) {
      calendarSheetRef.current?.present();
      return;
    }
    if (isGuest) {
      Alert.alert(
        "Войдите в аккаунт",
        "Для бронирования автомобиля необходимо войти.",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Войти", onPress: () => router.push("/login" as Href) },
        ],
      );
      return;
    }
    if (!isVerified) {
      Alert.alert(
        "Загрузите документы",
        "Сначала нам нужно проверить ваши права в профиле.",
        [
          { text: "Позже", style: "cancel" },
          { text: "В профиль", onPress: () => router.push("/profile" as Href) },
        ],
      );
      return;
    }
    router.push({ pathname: "/checkout/[id]", params: { id: car.id } });
  };

  if (isLoading || !car)
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;

  const descriptionText =
    car?.description?.ru ||
    car?.description?.en ||
    "Отличный автомобиль в идеальном состоянии. Своевременное ТО.";

  // --- МИКРОКОМПОНЕНТЫ ДЛЯ ЧИСТОТЫ КОДА ---

  // 1. Карусель фото
  const renderCarousel = () => {
    const images =
      car.images?.length > 0
        ? car.images
        : [{ url: "https://via.placeholder.com/800x600?text=No+Image" }];

    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
            );
            setCurrentImageIndex(index);
          }}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <Image
              source={item.url}
              style={{ width: SCREEN_WIDTH, height: 280 }}
              contentFit="cover"
              placeholder={{ blurhash }}
            />
          )}
        />
        {/* Кнопка НАЗАД */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Индикатор 1/5 */}
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1} / {images.length}
          </Text>
        </View>
      </View>
    );
  };

  // 2. Умные Хайлайты
  const renderHighlights = () => (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      {car.deposit_amount === 0 && (
        <View style={styles.highlightRow}>
          <View
            style={[styles.highlightIcon, { backgroundColor: colors.accentBg }]}
          >
            <Ionicons name="wallet-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.highlightText}>
            <Text
              style={[styles.highlightTitle, { color: colors.textPrimary }]}
            >
              Аренда без залога
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Вам не нужно замораживать деньги на карте.
            </Text>
          </View>
        </View>
      )}
      <View style={styles.highlightRow}>
        <View
          style={[styles.highlightIcon, { backgroundColor: colors.accentBg }]}
        >
          <Ionicons name="star-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.highlightText}>
          <Text style={[styles.highlightTitle, { color: colors.textPrimary }]}>
            Идеально для долгих поездок
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            100% клиентов высоко оценили комфорт этого авто.
          </Text>
        </View>
      </View>
    </View>
  );
  // 3. Таблица скидок (Идеально по скрину)
  const renderDiscounts = () => {
    if (!car.discount_tiers || Object.keys(car.discount_tiers).length === 0)
      return null;

    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.textPrimary, marginBottom: 0 },
            ]}
          >
            Скидки на аренду
          </Text>
          <View
            style={[styles.profitBadge, { backgroundColor: colors.successBg }]}
          >
            <Text
              style={{
                color: colors.success,
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              Выгодно
            </Text>
          </View>
        </View>

        {/* Базовая цена (в своей плашке) */}
        <View style={[styles.discountRow, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
            от 1 суток
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {car.price_per_day} ₽{" "}
            <Text style={{ color: colors.textSecondary, fontWeight: "400" }}>
              / сутки
            </Text>
          </Text>
        </View>

        {/* Скидки (каждая в своей плашке) */}
        {Object.entries(car.discount_tiers)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([daysReq, discount], idx) => {
            const discPrice = Math.floor(
              car.price_per_day - (car.price_per_day * Number(discount)) / 100,
            );
            return (
              <View
                key={idx}
                style={[
                  styles.discountRow,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
                    от {daysReq} суток
                  </Text>
                  <View
                    style={[
                      styles.discountPercent,
                      { backgroundColor: colors.errorBg },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.error,
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      -{Number(discount)}%
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  {discPrice} ₽{" "}
                  <Text
                    style={{ color: colors.textSecondary, fontWeight: "400" }}
                  >
                    / сутки
                  </Text>
                </Text>
              </View>
            );
          })}
      </View>
    );
  };

  // 4. Характеристики и Правила
  const renderSpecRow = (label: string, value: string | number) => (
    <View style={styles.specRow}>
      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
        {value}
      </Text>
    </View>
  );

  return (
    // ОБОИ ЭКРАНА СЕРЫЕ
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {renderCarousel()}

        {/* КАРТОЧКА 1: ШАПКА */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              marginTop: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            },
          ]}
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
              {car.reviews_count || 0} {t("reviews", "отзывов")}
            </Text>
          </View>
        </View>

        {renderHighlights()}
        {renderDiscounts()}

        {/* КАРТОЧКА: ОПИСАНИЕ */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Описание
          </Text>
          <Text
            style={{ color: colors.textPrimary, fontSize: 15, lineHeight: 24 }}
          >
            {descriptionText}
          </Text>
        </View>

        {/* КАРТОЧКА: ХАРАКТЕРИСТИКИ */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Характеристики автомобиля
          </Text>
          {renderSpecRow(
            "Двигатель",
            `${car.fuel_type}, ${car.horsepower} л.с.`,
          )}
          {renderSpecRow("Привод", car.drive_type)}
          {renderSpecRow("Год", car.year)}
          {renderSpecRow("Коробка", car.transmission)}
          {renderSpecRow("Кузов", car.body_type)}
        </View>

        {/* КАРТОЧКА: ЛОКАЦИЯ (Заглушка карты) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              padding: 0,
              overflow: "hidden",
            },
          ]}
        >
          <View style={styles.mapPlaceholder}>
            <Ionicons
              name="location-outline"
              size={40}
              color="#fff"
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Местоположение автомобиля
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Россия, Москва,{"\n"}Район выдачи авто
            </Text>
            <TouchableOpacity style={styles.mapBtn}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Смотреть на карте
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* КАРТОЧКА: ПРАВИЛА АРЕНДЫ */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Правила аренды
          </Text>
          {renderSpecRow(
            "Включенный пробег",
            `${car.mileage_limit_per_day} км / сутки`,
          )}
          {renderSpecRow("Перепробег", `${car.price_per_km_over_limit} ₽ / км`)}
          {renderSpecRow("Минимальный возраст", `${car.min_age} год(а)`)}
          {renderSpecRow("Страховка", car.insurance_type)}
        </View>

        {/* КАРТОЧКА: ОТЗЫВЫ (Заглушка для визуала) */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Отзывы и оценки
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: colors.warning,
                marginRight: 8,
              }}
            >
              5.0
            </Text>
            <View style={{ flexDirection: "row" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={16}
                  color={colors.warning}
                />
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
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accent,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                >
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
                  Алексей Смирнов
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  12 мая 2025
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Машина в отличном техническом состоянии. Передача прошла быстро,
              арендодатель вежливый. Рекомендую!
            </Text>
          </View>
          <TouchableOpacity>
            <Text
              style={{ color: colors.accent, fontSize: 16, fontWeight: "bold" }}
            >
              Смотреть все отзывы
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ФИКСИРОВАННЫЙ ПОДВАЛ */}
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
        onDayPress={(day) => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 24, // БОЛЬШИЕ скругления как на скринах!
    marginHorizontal: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // Карусель
  carouselContainer: { position: "relative" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    position: "absolute",
    bottom: 44,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  // Хайлайты
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  highlightText: { flex: 1 },
  highlightTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },

  // Скидки
  profitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16, // Добавили внутренний отступ для плашки
    borderRadius: 12, // Закруглили углы плашки
    marginBottom: 8, // Добавили отступ между плашками
  },
  discountPercent: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // Характеристики и Правила (БЕЗ ЛИНИЙ)
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8, // Чуть сжали по вертикали, раз нет линий
  },
  specLabel: {
    fontSize: 15,
  },
  specValue: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    paddingLeft: 16,
  },

  // Карта
  mapPlaceholder: {
    backgroundColor: "#4a5568",
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
