import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTranslation } from "react-i18next";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { applyFilters, FiltersState } from "@/src/store/slices/filtersSlice";
import {
  BodyType,
  FuelType,
  Transmission,
  CarColor,
  DriveType,
} from "@/src/types";
import { MAX_SLIDER_PRICE } from "../screens/Catalog/constants";

const { width } = Dimensions.get("window");

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
}

const BODY_TYPES = Object.values(BodyType) as BodyType[];
const FUEL_TYPES = Object.values(FuelType) as FuelType[];
const TRANSMISSIONS = Object.values(Transmission) as Transmission[];
const DRIVE_TYPES = Object.values(DriveType) as DriveType[];
const COLORS = Object.values(CarColor) as CarColor[];

const POPULAR_BRANDS = [
  "Toyota",
  "BMW",
  "Mercedes-Benz",
  "Kia",
  "Hyundai",
  "Audi",
  "Tesla",
  "Chery",
];
const FEATURES_MOCK = [
  { id: 1, name: "Кондиционер" },
  { id: 2, name: "Климат-контроль" },
  { id: 3, name: "Apple CarPlay" },
  { id: 4, name: "Детское кресло" },
  { id: 6, name: "Камера заднего вида" },
];

const COLOR_MAP: Record<CarColor, string> = {
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  GREY: "#808080",
  RED: "#FF0000",
  BLUE: "#0000FF",
  GREEN: "#008000",
  YELLOW: "#FFFF00",
  BROWN: "#8B4513",
  PINK: "#FFC0CB",
  ORANGE: "#FFA500",
};

export const FiltersModal = ({ visible, onClose }: FiltersModalProps) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentFilters = useAppSelector((state) => state.filters);

  const [draft, setDraft] = useState<FiltersState>(currentFilters);
  const [sliderValues, setSliderValues] = useState([0, MAX_SLIDER_PRICE]);

  useEffect(() => {
    if (visible) {
      setDraft(currentFilters);
      setSliderValues([
        currentFilters.min_price || 0,
        currentFilters.max_price || MAX_SLIDER_PRICE,
      ]);
    }
  }, [visible, currentFilters]);

  const handleSliderChange = (values: number[]) => {
    setSliderValues(values);
    setDraft({
      ...draft,
      min_price: values[0],
      max_price: values[1] === MAX_SLIDER_PRICE ? undefined : values[1],
    });
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

  const handleRangeInput = (key: keyof FiltersState, text: string) => {
    const val = text ? Number(text.replace(/[^0-9]/g, "")) : undefined;
    setDraft({ ...draft, [key]: val });
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

  const activeTags = [
    ...(draft.brands || []).map((v) => ({
      key: "brands" as ArrayKeys,
      val: v,
      label: v,
    })),
    ...(draft.body_types || []).map((v) => ({
      key: "body_types" as ArrayKeys,
      val: v,
      label: t(`body_${v.toLowerCase()}`, v),
    })),
    ...(draft.transmissions || []).map((v) => ({
      key: "transmissions" as ArrayKeys,
      val: v,
      label: t(`transmission_${v.toLowerCase()}`, v),
    })),
    ...(draft.fuel_types || []).map((v) => ({
      key: "fuel_types" as ArrayKeys,
      val: v,
      label: t(`fuel_${v.toLowerCase()}`, v),
    })),
    ...(draft.drive_types || []).map((v) => ({
      key: "drive_types" as ArrayKeys,
      val: v,
      label: v,
    })),
    ...(draft.feature_ids || []).map((v) => ({
      key: "feature_ids" as ArrayKeys,
      val: v,
      label: FEATURES_MOCK.find((f) => f.id === v)?.name || `Опция ${v}`,
    })),
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
            Фильтры
          </Text>
          <View style={{ flex: 1 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {activeTags.length > 0 ? (
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
                  Очистить все
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, marginTop: 0 },
            ]}
          >
            Цена за сутки, ₽
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
                до
              </Text>
              <TextInput
                style={{ color: colors.textPrimary, fontSize: 16, flex: 1 }}
                keyboardType="numeric"
                value={draft.max_price ? draft.max_price.toString() : ""}
                onChangeText={(t) => handlePriceInput("max", t)}
                placeholder="Любая"
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

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Марка автомобиля
          </Text>
          <View style={styles.pillsContainer}>
            {POPULAR_BRANDS.map((brand) => {
              const isActive = draft.brands.includes(brand);
              return (
                <TouchableOpacity
                  key={brand}
                  onPress={() => toggleItem("brands", brand)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isActive
                        ? colors.accentBg
                        : colors.surface,
                      borderColor: isActive ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isActive ? colors.accent : colors.textPrimary,
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Тип кузова
          </Text>
          <View style={styles.pillsContainer}>
            {BODY_TYPES.map((type) => {
              const isActive = draft.body_types.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => toggleItem("body_types", type)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isActive
                        ? colors.accentBg
                        : colors.surface,
                      borderColor: isActive ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isActive ? colors.accent : colors.textPrimary,
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {t(`body_${type.toLowerCase()}`, type)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Коробка передач
          </Text>
          <View style={styles.pillsContainer}>
            {TRANSMISSIONS.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => toggleItem("transmissions", type)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.transmissions.includes(type)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.transmissions.includes(type)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.transmissions.includes(type)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.transmissions.includes(type)
                      ? "600"
                      : "400",
                  }}
                >
                  {t(`transmission_${type.toLowerCase()}`, type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Привод
          </Text>
          <View style={styles.pillsContainer}>
            {DRIVE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => toggleItem("drive_types", type)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.drive_types.includes(type)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.drive_types.includes(type)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.drive_types.includes(type)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.drive_types.includes(type)
                      ? "600"
                      : "400",
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Двигатель
          </Text>
          <View style={styles.pillsContainer}>
            {FUEL_TYPES.map((fuel) => (
              <TouchableOpacity
                key={fuel}
                onPress={() => toggleItem("fuel_types", fuel)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: draft.fuel_types.includes(fuel)
                      ? colors.accentBg
                      : colors.surface,
                    borderColor: draft.fuel_types.includes(fuel)
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: draft.fuel_types.includes(fuel)
                      ? colors.accent
                      : colors.textPrimary,
                    fontWeight: draft.fuel_types.includes(fuel) ? "600" : "400",
                  }}
                >
                  {t(`fuel_${fuel.toLowerCase()}`, fuel)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 10 }}>
            {renderRangeInputsRow(
              "Год выпуска",
              "min_year",
              "max_year",
              "2020",
            )}
            {renderRangeInputsRow(
              "Пробег, км",
              "min_mileage",
              "max_mileage",
              "0",
            )}
            {renderRangeInputsRow(
              "Мощность, л.с.",
              "min_power",
              "max_power",
              "150",
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Комплектация
          </Text>
          <View style={styles.pillsContainer}>
            {FEATURES_MOCK.map((feature) => {
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
                    {feature.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Цвет кузова
          </Text>
          <View style={styles.pillsContainer}>
            {COLORS.map((colorEnum) => {
              const isActive = draft.colors.includes(colorEnum);
              const hex = COLOR_MAP[colorEnum];
              const isWhite = hex === "#FFFFFF";
              return (
                <TouchableOpacity
                  key={colorEnum}
                  onPress={() => toggleItem("colors", colorEnum)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: hex,
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
                  {isActive ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={isWhite ? "#000" : "#FFF"}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Рейтинг авто
          </Text>
          <View style={styles.pillsContainer}>
            {[4.0, 4.5, 4.8].map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() =>
                  setDraft({
                    ...draft,
                    min_rating:
                      draft.min_rating === rating ? undefined : rating,
                  })
                }
                style={[
                  styles.pill,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      draft.min_rating === rating
                        ? colors.warningBg
                        : colors.surface,
                    borderColor:
                      draft.min_rating === rating
                        ? colors.warning
                        : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name="star"
                  size={14}
                  color={colors.warning}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color:
                      draft.min_rating === rating
                        ? colors.warningText
                        : colors.textPrimary,
                    fontWeight: draft.min_rating === rating ? "600" : "400",
                  }}
                >
                  {rating} и выше
                </Text>
              </TouchableOpacity>
            ))}
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
            <Text style={styles.applyBtnText}>Показать машины</Text>
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
