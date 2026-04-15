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

interface Props {
  carsCount: number;
  activeCarClass?: string | null;
  // 👇 Новые пропы для избранного
  isFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  // Остальные
  onSelectCarClass: (id: string) => void;
  onOpenQuickFilter: (id: string) => void;
  onOpenSort: () => void;
}

export const CatalogListHeader = ({
  carsCount,
  activeCarClass,
  isFavoritesOnly,
  onToggleFavorites,
  onSelectCarClass,
  onOpenQuickFilter,
  onOpenSort,
}: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();

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
          {/* 👇 КНОПКА ИЗБРАННОГО (ВСЕГДА ПЕРВАЯ) */}
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

          {/* ОСТАЛЬНЫЕ ФИЛЬТРЫ ИЗ КОНСТАНТ */}
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

      {/* TABS КЛАССОВ */}
      <View style={{ height: 130, marginTop: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {CAR_CLASSES.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onSelectCarClass(item.id)}
              style={[
                styles.classCard,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    activeCarClass === item.id ? colors.accent : "transparent",
                },
              ]}
            >
              <Image
                source={item.img}
                style={styles.classImg}
                resizeMode="contain"
              />
              <Text style={{ color: colors.textPrimary, fontWeight: "bold" }}>
                {item.label}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                {item.price}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* СОРТИРОВКА И РЕЗУЛЬТАТЫ */}
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
