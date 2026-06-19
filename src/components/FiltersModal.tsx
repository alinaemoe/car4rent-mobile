import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { axiosInstance } from "@/src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { applyFilters, FiltersState } from "@/src/store/slices/filtersSlice";
import { MAX_SLIDER_PRICE } from "../screens/Catalog/constants";
// 👇 ИМПОРТИРУЕМ НОВЫЕ ТИПЫ ДЛЯ СЛОВАРЕЙ
import { DictColorOption, DictOption } from "@/src/types";

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FiltersModal = ({ visible, onClose }: FiltersModalProps) => {
  const colors = useAppColors();
  const { i18n, t } = useTranslation();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language || "ru";

  const currentFilters = useAppSelector((state) => state.filters);
  const { features, settings } = useAppSelector((state) => state.dictionaries);

  const [draft, setDraft] = useState<FiltersState>(currentFilters);
  const [sliderValues, setSliderValues] = useState([0, MAX_SLIDER_PRICE]);

  // 👇 ЯВНО ТИПИЗИРУЕМ МАССИВЫ ИЗ НАСТРОЕК (чтобы убрать ошибки any)
  const BRANDS: string[] = settings.POPULAR_BRANDS || [];
  const BODY_TYPES: DictOption[] = settings.DICT_BODY_TYPES || [];
  const TRANSMISSIONS: DictOption[] = settings.DICT_TRANSMISSIONS || [];
  const FUEL_TYPES: DictOption[] = settings.DICT_FUEL_TYPES || [];
  const DRIVE_TYPES: DictOption[] = settings.DICT_DRIVE_TYPES || [];
  const COLORS: DictColorOption[] = settings.DICT_COLORS || [];

  useEffect(() => {
    if (visible) {
      setDraft(currentFilters);
      setSliderValues([
        currentFilters.min_price || 0,
        currentFilters.max_price || MAX_SLIDER_PRICE,
      ]);
    }
  }, [visible, currentFilters]);

  // ДИНАМИЧЕСКИЙ ПОДСЧЕТ МАШИН
  const { data: countData } = useQuery({
    queryKey: ["cars", "count", draft],
    queryFn: async () => {
      const params: any = { limit: 1 };
      Object.entries(draft).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) params[key] = value.join(",");
        } else if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
      const { data } = await axiosInstance.get("/cars/catalog", { params });
      return data;
    },
    enabled: visible,
  });

  const totalCars = countData?.meta?.total || 0;

  // ОБРАБОТЧИКИ
  const handleSliderChange = (values: number[]) => {
    setSliderValues(values);
    setDraft({
      ...draft,
      min_price: values[0],
      max_price: values[1] === MAX_SLIDER_PRICE ? undefined : values[1],
    });
  };

  const handleRangeInput = (key: keyof FiltersState, text: string) => {
    const val = text ? Number(text.replace(/[^0-9]/g, "")) : undefined;
    setDraft({ ...draft, [key]: val });
  };

  const handlePriceInput = (type: "min" | "max", text: string) => {
    const val = Number(text.replace(/[^0-9]/g, "")) || 0;
    if (type === "min") {
      setSliderValues([val, sliderValues[1]]);
      setDraft({ ...draft, min_price: val || undefined });
    } else {
      setSliderValues([sliderValues[0], val || MAX_SLIDER_PRICE]);
      setDraft({ ...draft, max_price: val || undefined });
    }
  };

  type ArrayKeys = keyof Pick<
    FiltersState,
    | "brands"
    | "body_types"
    | "transmissions"
    | "fuel_types"
    | "drive_types"
    | "colors"
    | "feature_ids"
  >;

  const toggleItem = <K extends ArrayKeys>(
    key: K,
    value: FiltersState[K][number],
  ) => {
    const list = (draft[key] as any[]) || [];
    const isSelected = list.includes(value);
    setDraft({
      ...draft,
      [key]: isSelected
        ? list.filter((item) => item !== value)
        : [...list, value],
    });
  };

  const handleApply = () => {
    dispatch(applyFilters(draft));
    onClose();
  };

  const handleClearAll = () => {
    setDraft({
      ...draft,
      brands: [],
      body_types: [],
      fuel_types: [],
      transmissions: [],
      drive_types: [],
      colors: [],
      feature_ids: [],
      min_price: undefined,
      max_price: undefined,
      min_year: undefined,
      max_year: undefined,
      min_mileage: undefined,
      max_mileage: undefined,
      min_power: undefined,
      max_power: undefined,
      min_rating: undefined,
    });
    setSliderValues([0, MAX_SLIDER_PRICE]);
  };

  // --- СБОРКА АКТИВНЫХ ТЕГОВ ---
  const activeTags = [
    ...(draft.brands || []).map((v) => ({
      key: "brands" as ArrayKeys,
      val: v,
      label: v,
    })),
    ...(draft.body_types || []).map((v) => ({
      key: "body_types" as ArrayKeys,
      val: v,
      label: BODY_TYPES.find((b) => b.id === v)?.label || v,
    })),
    ...(draft.transmissions || []).map((v) => ({
      key: "transmissions" as ArrayKeys,
      val: v,
      label: TRANSMISSIONS.find((b) => b.id === v)?.label || v,
    })),
    ...(draft.fuel_types || []).map((v) => ({
      key: "fuel_types" as ArrayKeys,
      val: v,
      label: FUEL_TYPES.find((b) => b.id === v)?.label || v,
    })),
    ...(draft.drive_types || []).map((v) => ({
      key: "drive_types" as ArrayKeys,
      val: v,
      label: DRIVE_TYPES.find((b) => b.id === v)?.label || v,
    })),
    ...(draft.feature_ids || []).map((v) => {
      const feat = features.find((f) => f.id === v);
      return {
        key: "feature_ids" as ArrayKeys,
        val: v,
        label: feat ? feat.description[currentLang] : `Опция ${v}`,
      };
    }),
  ];

  const renderRangeInputsRow = (
    label: string,
    minKey: keyof FiltersState,
    maxKey: keyof FiltersState,
    placeholderStr: string,
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {label}
      </Text>
      <View style={styles.priceInputsRow}>
        <View
          style={[
            styles.inlineInputBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              color: colors.textSecondary,
              marginRight: 8,
              fontSize: 14,
            }}
          >
            от
          </Text>
          <TextInput
            style={{ color: colors.textPrimary, fontSize: 16, flex: 1 }}
            keyboardType="numeric"
            value={draft[minKey] ? String(draft[minKey]) : ""}
            onChangeText={(t) => handleRangeInput(minKey, t)}
            placeholder={placeholderStr}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View
          style={[
            styles.inlineInputBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              color: colors.textSecondary,
              marginRight: 8,
              fontSize: 14,
            }}
          >
            до
          </Text>
          <TextInput
            style={{ color: colors.textPrimary, fontSize: 16, flex: 1 }}
            keyboardType="numeric"
            value={draft[maxKey] ? String(draft[maxKey]) : ""}
            onChangeText={(t) => handleRangeInput(maxKey, t)}
            placeholder={placeholderStr}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={{ flex: 1 }}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary, flex: 2, textAlign: "center" },
            ]}
          >
            {t("filters.title", "Фильтры")}
          </Text>
          <View style={{ flex: 1 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* АКТИВНЫЕ БЕЙДЖИКИ */}
          {activeTags.length > 0 && (
            <View
              style={{
                marginBottom: 24,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {activeTags.map((tag, idx) => (
                  <TouchableOpacity
                    key={`${tag.key}-${idx}`}
                    onPress={() => toggleItem(tag.key, tag.val)}
                    style={[
                      styles.activeTag,
                      { backgroundColor: colors.accent },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        marginRight: 6,
                        fontSize: 13,
                        fontWeight: "500",
                      }}
                    >
                      {tag.label}
                    </Text>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleClearAll}
                style={{ marginTop: 12, alignSelf: "flex-start" }}
              >
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {t("common.clear_all", "Очистить все")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ЦЕНА */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, marginTop: 0 },
            ]}
          >
            {t("filters.price_per_day", "Цена за сутки, Br")}
          </Text>
          <View style={styles.priceInputsRow}>
            <View
              style={[
                styles.inlineInputBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  marginRight: 8,
                  fontSize: 14,
                }}
              >
                {t("common.from_short", "от")}
              </Text>
              <TextInput
                style={{ color: colors.textPrimary, fontSize: 16, flex: 1 }}
                keyboardType="numeric"
                value={draft.min_price ? draft.min_price.toString() : ""}
                onChangeText={(t) => handlePriceInput("min", t)}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View
              style={[
                styles.inlineInputBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  marginRight: 8,
                  fontSize: 14,
                }}
              >
                {t("common.to_short", "до")}
              </Text>
              <TextInput
                style={{ color: colors.textPrimary, fontSize: 16, flex: 1 }}
                keyboardType="numeric"
                value={draft.max_price ? draft.max_price.toString() : ""}
                onChangeText={(t) => handlePriceInput("max", t)}
                placeholder={t("common.any", "Любая")}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          <View
            style={{ alignItems: "center", marginTop: 15, marginBottom: 20 }}
          >
            <MultiSlider
              values={[sliderValues[0], sliderValues[1]]}
              sliderLength={width - 60}
              onValuesChange={handleSliderChange}
              min={0}
              max={MAX_SLIDER_PRICE}
              step={500}
              selectedStyle={{ backgroundColor: colors.accent }}
              unselectedStyle={{ backgroundColor: colors.border }}
              markerStyle={{
                backgroundColor: "#fff",
                elevation: 3,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 2,
              }}
              trackStyle={{ height: 4, borderRadius: 2 }}
            />
          </View>

          {/* МАРКИ */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("filters.brand", "Марка автомобиля")}
          </Text>
          <View style={styles.pillsContainer}>
            {BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand}
                onPress={() => toggleItem("brands", brand)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.brands.includes(brand)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.brands.includes(brand)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.brands.includes(brand)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.brands.includes(brand) ? "600" : "400",
                  }}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* КУЗОВ */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("filters.body_type", "Тип кузова")}
          </Text>
          <View style={styles.pillsContainer}>
            {BODY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => toggleItem("body_types", type.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.body_types.includes(type.id)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.body_types.includes(type.id)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.body_types.includes(type.id)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.body_types.includes(type.id)
                      ? "600"
                      : "400",
                  }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* КОРОБКА И ПРИВОД И ТОПЛИВО */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("filters.transmission", "Коробка передач")}
          </Text>
          <View style={styles.pillsContainer}>
            {TRANSMISSIONS.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => toggleItem("transmissions", type.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.transmissions.includes(type.id)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.transmissions.includes(type.id)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.transmissions.includes(type.id)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.transmissions.includes(type.id)
                      ? "600"
                      : "400",
                  }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("filters.drive_type", "Привод")}
          </Text>
          <View style={styles.pillsContainer}>
            {DRIVE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => toggleItem("drive_types", type.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.drive_types.includes(type.id)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.drive_types.includes(type.id)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.drive_types.includes(type.id)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.drive_types.includes(type.id)
                      ? "600"
                      : "400",
                  }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("filters.engine", "Двигатель")}
          </Text>
          <View style={styles.pillsContainer}>
            {FUEL_TYPES.map((fuel) => (
              <TouchableOpacity
                key={fuel.id}
                onPress={() => toggleItem("fuel_types", fuel.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.fuel_types.includes(fuel.id)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.fuel_types.includes(fuel.id)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.fuel_types.includes(fuel.id)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.fuel_types.includes(fuel.id)
                      ? "600"
                      : "400",
                  }}
                >
                  {fuel.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ДИАПАЗОНЫ */}
          <View style={{ marginTop: 10 }}>
            {renderRangeInputsRow(
              t("filters.year_label", "Год выпуска"),
              "min_year",
              "max_year",
              "2020",
            )}
            {renderRangeInputsRow(
              t("filters.mileage_label", "Пробег, км"),
              "min_mileage",
              "max_mileage",
              "0",
            )}
            {renderRangeInputsRow(
              t("filters.power_label", "Мощность, л.с."),
              "min_power",
              "max_power",
              "150",
            )}
          </View>

          {/* ОПЦИИ */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("filters.features", "Комплектация")}
          </Text>
          <View style={styles.pillsContainer}>
            {features.map((feature) => {
              const isActive = draft.feature_ids.includes(feature.id);
              return (
                <TouchableOpacity
                  key={feature.id}
                  onPress={() => toggleItem("feature_ids", feature.id)}
                  style={[
                    styles.featurePill,
                    {
                      backgroundColor: isActive
                        ? colors.accentBg
                        : colors.surface,
                      borderColor: isActive ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name={isActive ? "checkbox" : "square-outline"}
                    size={18}
                    color={isActive ? colors.accent : colors.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: isActive ? colors.accent : colors.textPrimary,
                      fontWeight: isActive ? "500" : "400",
                    }}
                  >
                    {feature.description[currentLang] || feature.internal_name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ЦВЕТА */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("filters.color", "Цвет кузова")}
          </Text>
          <View style={styles.pillsContainer}>
            {COLORS.map((colorObj) => {
              const isActive = draft.colors.includes(colorObj.id);
              const isWhite = colorObj.hex === "#FFFFFF";
              return (
                <TouchableOpacity
                  key={colorObj.id}
                  onPress={() => toggleItem("colors", colorObj.id)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: colorObj.hex,
                      borderColor: isActive
                        ? colors.accent
                        : isWhite
                          ? colors.border
                          : "transparent",
                      borderWidth: isActive || isWhite ? 2 : 0,
                      opacity: isActive ? 1 : 0.8,
                    },
                  ]}
                >
                  {isActive && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={isWhite ? "#000" : "#FFF"}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleApply}
            style={[styles.applyBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.9}
          >
            <Text style={styles.applyBtnText}>
              {t("filters.show_results", {
                count: totalCars,
                defaultValue: "Показать {{count}} авто",
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
  },
  priceInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  inlineInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  footer: { padding: 20, borderTopWidth: 1, paddingBottom: 30 },
  applyBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  applyBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
