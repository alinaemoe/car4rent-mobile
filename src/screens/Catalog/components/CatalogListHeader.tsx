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
import { applyFilters, FiltersState } from "@/src/store/slices/filtersSlice"; // 👈 не забудь импорт FiltersState

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

  // Достаем весь объект фильтров
  const filters = useAppSelector((state) => state.filters);
  const { min_price, max_price } = filters;

  // --- ЛОГИКА АКТИВНЫХ БЕЙДЖЕЙ ---

  // Собираем все выбранные массивы в плоский список
  const activeTags: { key: keyof FiltersState; val: any; label: string }[] = [
    ...(filters.brands || []).map((v) => ({
      key: "brands" as const,
      val: v,
      label: v,
    })),
    ...(filters.body_types || []).map((v) => ({
      key: "body_types" as const,
      val: v,
      label: `Кузов: ${t(`body_${v.toLowerCase()}`, v)}`,
    })),
    ...(filters.transmissions || []).map((v) => ({
      key: "transmissions" as const,
      val: v,
      label: `КПП: ${t(`transmission_${v.toLowerCase()}`, v)}`,
    })),
    ...(filters.fuel_types || []).map((v) => ({
      key: "fuel_types" as const,
      val: v,
      label: `Топливо: ${t(`fuel_${v.toLowerCase()}`, v)}`,
    })),
    ...(filters.drive_types || []).map((v) => ({
      key: "drive_types" as const,
      val: v,
      label: `Привод: ${v}`,
    })),
  ];

  // Удаление конкретного тега
  // Удаление конкретного тега
  const handleRemoveTag = (key: keyof FiltersState, val: any) => {
    const list = (filters[key] as any[]) || [];

    // 🔥 Приводим всё к строке для надежного сравнения (чтобы 1 !== "1" нас не сломало)
    const updatedList = list.filter((item) => String(item) !== String(val));

    dispatch(applyFilters({ [key]: updatedList }));
  };

  // Сброс вообще всех фильтров
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

  // Логика нажатия на класс авто
  const handleClassSelect = (min: number, max?: number) => {
    if (min_price === min && max_price === max) {
      dispatch(applyFilters({ min_price: undefined, max_price: undefined }));
    } else {
      dispatch(applyFilters({ min_price: min, max_price: max }));
    }
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
          {/* 1. КНОПКА СБРОСА ВСЕХ ФИЛЬТРОВ (показываем, если есть хоть 1 тег) */}
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

          {/* 2. АКТИВНЫЕ ВЫБРАННЫЕ БЕЙДЖИКИ (Transparent Style) */}
          {activeTags.map((tag, idx) => (
            <TouchableOpacity
              key={`active-${tag.key}-${idx}`}
              style={[
                styles.quickPill,
                {
                  backgroundColor: colors.accentBg, // 👈 Тот самый полупрозрачный фон
                  borderWidth: 1,
                  borderColor: colors.accent, // 👈 Тонкая рамка в цвет текста
                },
              ]}
              activeOpacity={0.8}
              onPress={() => handleRemoveTag(tag.key, tag.val)}
            >
              <Text
                style={{
                  color: colors.accent, // 👈 Акцентный текст вместо белого
                  fontSize: 14,
                  fontWeight: "600",
                  marginRight: 6,
                }}
              >
                {tag.label}
              </Text>
              {/* Крестик тоже красим в акцентный цвет */}
              <Ionicons name="close-circle" size={18} color={colors.accent} />
            </TouchableOpacity>
          ))}

          {/* 3. Кнопка Избранное */}
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

          {/* 4. Остальные выпадающие пилюли */}
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

      {/* TABS КЛАССОВ С ЭФФЕКТНЫМ ВЫЛЕТОМ */}
      <View style={{ height: 170, marginTop: 10, marginBottom: 5 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 14,
            paddingTop: 40, // Место для "вылета" крыши машины
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
                    // Оставляем фон всегда surface, чтобы не было "тяжелого" выделения
                    backgroundColor: colors.surface,
                    // Рамка становится акцентной только при активации
                    borderColor: isActive ? colors.accent : "transparent",
                    // Тень для активной карточки (Glow effect)
                    shadowColor: isActive ? colors.accent : "#000",
                    shadowOpacity: isActive ? 0.25 : 0.05,
                    shadowRadius: isActive ? 12 : 8,
                    elevation: isActive ? 6 : 2,
                    // Легкий подъем активной карточки
                    transform: [{ scale: isActive ? 1.05 : 1 }],
                  },
                ]}
              >
                {/* МАШИНА: Вылетает за границы карточки */}
                <View style={styles.imgWrapper}>
                  <Image
                    source={item.img}
                    style={[
                      styles.classImg,
                      {
                        // Машинка тоже реагирует на выбор
                        transform: [{ scale: isActive ? 1.1 : 1 }],
                        // Можно добавить легкий tint или насыщенность, если нужно, но лучше оставить натив
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>

                {/* ТЕКСТ: Теперь цвета строго привязаны к isActive */}
                <View style={styles.labelWrapper}>
                  <Text
                    style={[
                      styles.priceText,
                      { color: isActive ? colors.accent : colors.textPrimary }, // Тут не теряем!
                    ]}
                  >
                    {item.priceText}
                  </Text>
                  <Text
                    style={[
                      styles.classLabel,
                      {
                        color: isActive ? colors.accent : colors.textSecondary,
                      }, // И тут!
                    ]}
                  >
                    {item.label}
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
