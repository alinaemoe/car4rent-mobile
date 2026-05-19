import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { applyFilters, FiltersState } from "@/src/store/slices/filtersSlice";
import { CAR_CLASSES, QUICK_FILTERS } from "../constants";

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

  const filters = useAppSelector((state) => state.filters);
  const { min_price, max_price } = filters;

  // --- ЛОГИКА АКТИВНЫХ БЕЙДЖЕЙ ---
  const activeTags: { key: keyof FiltersState; val: any; label: string }[] = [
    ...(filters.brands || []).map((v) => ({
      key: "brands" as const,
      val: v,
      label: v,
    })),
    ...(filters.body_types || []).map((v) => ({
      key: "body_types" as const,
      val: v,
      label: t("filter.body_type_tag", {
        defaultValue: `Кузов: {{val}}`,
        val: t(`body_${v.toLowerCase()}`, v),
      }),
    })),
    ...(filters.transmissions || []).map((v) => ({
      key: "transmissions" as const,
      val: v,
      label: t("filter.transmission_tag", {
        defaultValue: `КПП: {{val}}`,
        val: t(`transmission_${v.toLowerCase()}`, v),
      }),
    })),
    ...(filters.fuel_types || []).map((v) => ({
      key: "fuel_types" as const,
      val: v,
      label: t("filter.fuel_type_tag", {
        defaultValue: `Топливо: {{val}}`,
        val: t(`fuel_${v.toLowerCase()}`, v),
      }),
    })),
    ...(filters.drive_types || []).map((v) => ({
      key: "drive_types" as const,
      val: v,
      label: t("filter.drive_type_tag", {
        defaultValue: `Привод: {{val}}`,
        val: v,
      }),
    })),
  ];

  const handleRemoveTag = (key: keyof FiltersState, val: any) => {
    const list = (filters[key] as any[]) || [];
    const updatedList = list.filter((item) => String(item) !== String(val));
    dispatch(applyFilters({ [key]: updatedList }));
  };

  const handleClearAll = () => {
    dispatch(
      applyFilters({
        brands: [],
        body_types: [],
        transmissions: [],
        fuel_types: [],
        drive_types: [],
        colors: [],
        feature_ids: [],
        min_price: undefined,
        max_price: undefined,
      }),
    );
  };

  const handleClassSelect = (min: number, max?: number) => {
    if (min_price === min && max_price === max) {
      dispatch(applyFilters({ min_price: undefined, max_price: undefined }));
    } else {
      dispatch(applyFilters({ min_price: min, max_price: max }));
    }
  };

  // 🔥 ХЕЛПЕР ДЛЯ БЕЗОПАСНОЙ ГЕНЕРАЦИИ ТЕКСТА ЦЕНЫ НА ЛЕТУ
  const renderPriceText = (item: (typeof CAR_CLASSES)[number]) => {
    const currency = t("common.currency_br", "Br");

    if (item.type === "up_to") {
      return `${t("common.up_to", "до")} ${item.maxPrice} ${currency}`;
    }
    if (item.type === "from") {
      return `${t("common.from", "от")} ${item.minPrice} ${currency}`;
    }
    return `${item.minPrice} - ${item.maxPrice} ${currency}`;
  };

  return (
    <View style={{ backgroundColor: colors.background, paddingBottom: 10 }}>
      {/* QUICK FILTERS + АКТИВНЫЕ БЕЙДЖИ */}
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
          {activeTags.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={[
                styles.quickPill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  paddingHorizontal: 10,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          {activeTags.map((tag, idx) => (
            <TouchableOpacity
              key={`active-${tag.key}-${idx}`}
              style={[
                styles.quickPill,
                {
                  backgroundColor: colors.accentBg,
                  borderWidth: 1,
                  borderColor: colors.accent,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => handleRemoveTag(tag.key, tag.val)}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontSize: 14,
                  fontWeight: "600",
                  marginRight: 6,
                }}
              >
                {tag.label}
              </Text>
              <Ionicons name="close-circle" size={18} color={colors.accent} />
            </TouchableOpacity>
          ))}

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
                {t(pill.labelKey, pill.defaultLabel)}{" "}
                {/* 🔥 Безопасный перевод таблеток */}
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

      {/* TABS КЛАССОВ С ЭФФЕКТНЫМ ВЫЛЕТОМ */}
      <View style={{ height: 170, marginTop: 10, marginBottom: 5 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 14,
            paddingTop: 40,
          }}
        >
          {CAR_CLASSES.map((item) => {
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
                    backgroundColor: colors.surface,
                    borderColor: isActive ? colors.accent : "transparent",
                    shadowColor: isActive ? colors.accent : "#000",
                    shadowOpacity: isActive ? 0.25 : 0.05,
                    shadowRadius: isActive ? 12 : 8,
                    elevation: isActive ? 6 : 2,
                    transform: [{ scale: isActive ? 1.05 : 1 }],
                  },
                ]}
              >
                <View style={styles.imgWrapper}>
                  <Image
                    source={item.img}
                    style={[
                      styles.classImg,
                      { transform: [{ scale: isActive ? 1.1 : 1 }] },
                    ]}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.labelWrapper}>
                  <Text
                    style={[
                      styles.priceText,
                      { color: isActive ? colors.accent : colors.textPrimary },
                    ]}
                  >
                    {renderPriceText(item)}{" "}
                    {/* 🔥 Сборка строки цены на лету, без багов! */}
                  </Text>
                  <Text
                    style={[
                      styles.classLabel,
                      {
                        color: isActive ? colors.accent : colors.textSecondary,
                      },
                    ]}
                  >
                    {t(item.labelKey, item.defaultLabel)}{" "}
                    {/* 🔥 Безопасный перевод названия */}
                  </Text>
                </View>
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

// Стили оставляй свои (styles.quickPill, styles.classCard, и т.д.)

const styles = StyleSheet.create({
  quickPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  classCard: {
    width: 145,
    height: 90,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 14,
    position: "relative",
    // Важно для теней на iOS
    shadowOffset: { width: 0, height: 4 },
  },

  imgWrapper: {
    position: "absolute",
    top: -42, // Глубокий вылет
    zIndex: 10,
    width: "100%",
    alignItems: "center",
  },

  classImg: {
    width: 110,
    height: 70,
  },

  labelWrapper: {
    alignItems: "center",
    zIndex: 1,
  },

  priceText: {
    fontSize: 16,
    fontWeight: "900", // Жирный акцент на цену
    letterSpacing: -0.5,
  },

  classLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
    letterSpacing: 0.5,
    opacity: 0.9,
  },

  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  resultsTitle: { fontSize: 18, fontWeight: "bold" },
  sortBtn: { padding: 8, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.05)" },
});
