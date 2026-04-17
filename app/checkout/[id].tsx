import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector } from "@/src/store";
import { useCarDetail } from "@/src/api/queries/useCars";
import { usePriceCalculator } from "@/src/hooks/usePriceCalculator";

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

// Месяцы в родительном падеже для идеального совпадения со скрином
const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();

  const { startDate, endDate } = useAppSelector((state) => state.filters);
  const { data: car } = useCarDetail(Number(id));

  const [destination, setDestination] = useState("");

  const {
    days,
    baseTotal,
    discountAmount,
    finalRentPrice,
    deposit,
    grandTotal,
  } = usePriceCalculator(car, startDate, endDate);

  // Форматирование: "18 апреля, 2026 в 12:00"
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Выберите дату";
    const d = new Date(dateString);
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}, ${d.getFullYear()} в 12:00`;
  };

  const handleCreateRequest = () => {
    console.log("🚀 Создаем бронь. Адрес:", destination, "Итого:", grandTotal);
    // router.push('/checkout/success');
  };

  if (!car)
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;

  // Определяем, активна ли кнопка (если нет дат, делаем ее бледной, как на скрине)
  const isFormValid = startDate && endDate;

  return (
    // Главный фон экрана - светло-серый
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* ТОП-БЛОК: Шапка + Машина (Бесшовный белый блок без скруглений внизу) */}
      <View style={{ backgroundColor: colors.background, paddingBottom: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Запрос на бронирование
          </Text>
          <View style={styles.backBtn} />
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: colors.surface, marginTop: 0 },
          ]}
        />

        {/* Mini Car Info */}
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
                5{" "}
              </Text>
              <Ionicons
                name="star"
                size={12}
                color={colors.warning}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.miniRating}>
                {car.reviews_count || 55} отзывов
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ПРОКРУЧИВАЕМАЯ ЧАСТЬ С КАРТОЧКАМИ */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 8, // Оставляем боковые отступы для карточек
          paddingTop: 20, // 👈 Отлепляем первую карточку от инфы о машине
          paddingBottom: 32, // Запас места снизу при прокрутке
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* КАРТОЧКА: ДАТЫ И МАРШРУТ */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          {/* Серый контейнер для дат */}
          <View
            style={[styles.grayContainer, { backgroundColor: colors.surface }]}
          >
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                {formatDate(startDate)}
              </Text>
            </View>

            {/* Линия между датами (с отступом под иконку) */}
            <View
              style={[styles.innerDivider, { backgroundColor: colors.border }]}
            />

            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                {formatDate(endDate)}
              </Text>
            </View>
          </View>

          {/* Инпут локации (отдельный серый контейнер) */}
          <View
            style={[
              styles.grayContainer,
              {
                backgroundColor: colors.surface,
                marginTop: 12,
                paddingVertical: 4,
              },
            ]}
          >
            <View style={styles.dateRow}>
              <Ionicons
                name="paper-plane-outline"
                size={22}
                color={colors.textSecondary}
                style={[
                  styles.inputIcon,
                  { transform: [{ rotate: "-45deg" }] },
                ]}
              />
              <TextInput
                placeholder="Куда едете?"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.textPrimary }]}
                value={destination}
                onChangeText={setDestination}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* КАРТОЧКА: СТОИМОСТЬ */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.priceHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
                Стоимость аренды
              </Text>
              <Ionicons
                name="chevron-up"
                size={18}
                color={colors.textPrimary}
                style={{ marginLeft: 8 }}
              />
            </View>
            <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
              {finalRentPrice} ₽
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
              Аренда {days} сут.
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
              {baseTotal} ₽
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={{ color: colors.error, fontSize: 15 }}>
                Скидка на аренду от{" "}
                {car.discount_tiers ? Object.keys(car.discount_tiers)[0] : 3}{" "}
                дней
              </Text>
              <Text style={{ color: colors.error, fontSize: 15 }}>
                -{discountAmount} ₽
              </Text>
            </View>
          )}

          <View
            style={[styles.priceHeader, { marginTop: 12, marginBottom: 0 }]}
          >
            <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
              Депозит
            </Text>
            <Text style={[styles.priceTitle, { color: colors.textPrimary }]}>
              {deposit > 0 ? `${deposit} ₽` : "Без залога"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ФИКСИРОВАННЫЙ ПОДВАЛ */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: isFormValid
                ? colors.accent
                : "rgba(33, 150, 243, 0.4)",
            }, // Бледнеет, если даты не выбраны
          ]}
          onPress={handleCreateRequest}
          activeOpacity={0.8}
          disabled={!isFormValid}
        >
          <Text style={styles.submitBtnText}>Продолжить</Text>
        </TouchableOpacity>
        <Text style={[styles.footerTip, { color: colors.textSecondary }]}>
          Укажите период аренды и регион поездки
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Топ-блок
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: {
    width: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  miniCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  miniImage: {
    width: 86,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e1e4e8",
  },
  miniInfo: {
    marginLeft: 16,
    flex: 1,
  },
  miniTitle: {
    fontSize: 17,
    fontWeight: "400",
    marginBottom: 4,
  },
  miniRating: {
    fontSize: 14,
    color: "#888",
  },

  // Карточки
  card: {
    borderRadius: 16, // Закругления карточек
    padding: 16,
    marginBottom: 16,
  },

  // Даты и инпуты
  grayContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "400",
  },
  innerDivider: {
    height: 1,
    marginLeft: 38, // Отступ, чтобы линия начиналась после иконки
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },

  // Блок стоимости
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // Подвал
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  footerTip: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 12,
  },
});
