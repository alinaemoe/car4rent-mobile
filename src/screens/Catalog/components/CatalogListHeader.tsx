import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { QUICK_FILTERS, CAR_CLASSES } from "../constants";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { applyFilters } from "@/src/store/slices/filtersSlice";

interface Props {
  carsCount: number;
  isFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onOpenQuickFilter: (id: string) => void;
  onOpenSort: () => void;
}

export const CatalogListHeader = ({
  carsCount,
  isFavoritesOnly,
  onToggleFavorites,
  onOpenQuickFilter,
  onOpenSort,
}: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Достаем цены напрямую из стора для синхронизации с классами
  const { min_price, max_price } = useAppSelector((state) => state.filters);

  // Логика нажатия на класс авто
  const handleClassSelect = (min: number, max?: number) => {
    // Если юзер кликает на УЖЕ активный класс — сбрасываем фильтр цены
    if (min_price === min && max_price === max) {
      dispatch(applyFilters({ min_price: undefined, max_price: undefined }));
    } else {
      // Иначе применяем диапазон
      dispatch(applyFilters({ min_price: min, max_price: max }));
    }
  };

  return (
    <View style={{ backgroundColor: colors.background, paddingBottom: 10 }}>
      {/* QUICK FILTERS */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingVertical: 12,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {/* Кнопка Избранное */}
          <TouchableOpacity
            style={[
              styles.quickPill,
              {
                backgroundColor: isFavoritesOnly
                  ? colors.errorBg
                  : colors.surface,
                borderColor: isFavoritesOnly ? colors.error : "transparent",
                borderWidth: 1,
              },
            ]}
            activeOpacity={0.8}
            onPress={onToggleFavorites}
          >
            <Ionicons
              name={isFavoritesOnly ? "heart" : "heart-outline"}
              size={16}
              color={isFavoritesOnly ? colors.error : colors.textPrimary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: isFavoritesOnly ? colors.error : colors.textPrimary,
                fontSize: 14,
                fontWeight: isFavoritesOnly ? "600" : "400",
              }}
            >
              {t("favorites", "Избранное")}
            </Text>
          </TouchableOpacity>

          {/* Остальные пилюли */}
          {QUICK_FILTERS.map((pill) => (
            <TouchableOpacity
              key={pill.id}
              style={[
                styles.quickPill,
                {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: "transparent",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => onOpenQuickFilter(pill.id)}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
                {pill.label}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={colors.textSecondary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TABS КЛАССОВ (СИНХРОНИЗИРОВАНЫ С ЦЕНОЙ) */}
      <View style={{ height: 130, marginTop: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {CAR_CLASSES.map((item) => {
            // Карточка активна, если стейт ЦЕНЫ совпадает с её пресетом
            const isActive =
              min_price === item.minPrice && max_price === item.maxPrice;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleClassSelect(item.minPrice, item.maxPrice)}
                style={[
                  styles.classCard,
                  {
                    backgroundColor: isActive
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: isActive ? colors.accent : "transparent",
                  },
                ]}
              >
                <Image
                  source={item.img}
                  style={styles.classImg}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    color: isActive ? colors.accent : colors.textPrimary,
                    fontWeight: "bold",
                  }}
                >
                  {item.label}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  {item.priceText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* РЕЗУЛЬТАТЫ */}
      <View style={styles.resultsRow}>
        <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>
          {t("found_cars", "Найдено")} {carsCount}
        </Text>
        <TouchableOpacity onPress={onOpenSort} style={styles.sortBtn}>
          <Ionicons name="swap-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  classCard: {
    width: 140,
    height: 110,
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  classImg: { width: 80, height: 40, marginBottom: 8 },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 10,
    paddingTop: 10,
  },
  resultsTitle: { fontSize: 18, fontWeight: "bold" },
  sortBtn: { padding: 8, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.05)" },
});
