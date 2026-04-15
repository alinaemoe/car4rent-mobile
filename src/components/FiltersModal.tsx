import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { applyFilters, FiltersState } from "@/src/store/slices/filtersSlice";
import { BodyType, FuelType } from "@/src/types";

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
}

// Приводим значения объектов к нашим типам из src/types
const BODY_TYPES = Object.values(BodyType) as BodyType[];
const FUEL_TYPES = Object.values(FuelType) as FuelType[];
const COLORS = ["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#808080"];

export const FiltersModal = ({ visible, onClose }: FiltersModalProps) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentFilters = useAppSelector((state) => state.filters);

  // Локальный стейт (Черновик фильтров)
  const [draft, setDraft] = useState<FiltersState>(currentFilters);

  // При открытии модалки синхронизируем черновик с актуальным Redux
  useEffect(() => {
    if (visible) setDraft(currentFilters);
  }, [visible, currentFilters]);

  type ArrayKeys = keyof Pick<
    FiltersState,
    "brands" | "body_types" | "transmissions" | "fuel_types" | "colors"
  >;

  const activeTags = [
    ...(draft.body_types || []).map((v) => ({
      key: "body_types" as ArrayKeys, // 👈 Явно приводим к нужному подтипу
      val: v,
      label: t(`body_${v.toLowerCase()}`, String(v)),
    })),
    ...(draft.fuel_types || []).map((v) => ({
      key: "fuel_types" as ArrayKeys, // 👈 И здесь тоже
      val: v,
      label: t(`fuel_${v.toLowerCase()}`, String(v)),
    })),
  ];

  const toggleItem = <K extends ArrayKeys>(
    key: K,
    value: FiltersState[K][number],
  ) => {
    const list = draft[key];

    if (Array.isArray(list)) {
      // Используем as any только внутри функции, чтобы успокоить сложную типизацию массивов
      const currentList = list as any[];
      const isSelected = currentList.includes(value);

      setDraft({
        ...draft,
        [key]: isSelected
          ? currentList.filter((item) => item !== value)
          : [...currentList, value],
      });
    }
  };

  const handleApply = () => {
    dispatch(applyFilters(draft));
    onClose();
  };

  const handleClearAll = () => {
    setDraft({
      ...draft,
      body_types: [],
      fuel_types: [],
      colors: [],
      min_price: undefined,
      max_price: undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* ХЕДЕР */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>
              {t("cancel", "Отмена")}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("filters", "Фильтры")}
          </Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
              {t("reset", "Сброс")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* ВЕРХНИЙ БЛОК: ВЫБРАННЫЕ БЕЙДЖИ */}
          {activeTags.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {activeTags.map((tag, idx) => (
                  <TouchableOpacity
                    key={`${tag.key}-${idx}`}
                    onPress={() => toggleItem(tag.key, tag.val)}
                    style={[
                      styles.activeTag,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <Text style={{ color: "#fff", marginRight: 4 }}>
                      {tag.label}
                    </Text>
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleClearAll}
                style={{ marginTop: 12 }}
              >
                <Text style={{ color: colors.error }}>
                  {t("clear_all", "Очистить все")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ЦЕНА */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("price", "Цена")}
          </Text>
          <View style={styles.priceRow}>
            <View
              style={[
                styles.priceInputWrap,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.textSecondary, marginRight: 8 }}>
                от
              </Text>
              <TextInput
                style={{ flex: 1, color: colors.textPrimary }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={draft.min_price?.toString() || ""}
                onChangeText={(text) =>
                  setDraft({
                    ...draft,
                    min_price: text ? Number(text) : undefined,
                  })
                }
              />
            </View>
            <View
              style={[
                styles.priceInputWrap,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.textSecondary, marginRight: 8 }}>
                до
              </Text>
              <TextInput
                style={{ flex: 1, color: colors.textPrimary }}
                keyboardType="numeric"
                placeholder="999999"
                placeholderTextColor={colors.textSecondary}
                value={draft.max_price?.toString() || ""}
                onChangeText={(text) =>
                  setDraft({
                    ...draft,
                    max_price: text ? Number(text) : undefined,
                  })
                }
              />
            </View>
          </View>

          {/* КУЗОВ */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("body_type", "Тип кузова")}
          </Text>
          <View style={styles.pillsContainer}>
            {BODY_TYPES.map((type) => {
              const isActive = draft.body_types.includes(type);
              return (
                <TouchableOpacity
                  key={String(type)}
                  onPress={() => toggleItem("body_types", type)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isActive ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isActive ? colors.accent : colors.textPrimary,
                    }}
                  >
                    {t(`body_${String(type).toLowerCase()}`, String(type))}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ТОПЛИВО (Добавил блок, раз он есть в типах) */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("fuel_type", "Тип топлива")}
          </Text>
          <View style={styles.pillsContainer}>
            {FUEL_TYPES.map((fuel) => {
              const isActive = draft.fuel_types.includes(fuel);
              return (
                <TouchableOpacity
                  key={String(fuel)}
                  onPress={() => toggleItem("fuel_types", fuel)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isActive ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isActive ? colors.accent : colors.textPrimary,
                    }}
                  >
                    {t(`fuel_${String(fuel).toLowerCase()}`, String(fuel))}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ЦВЕТА */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t("color", "Цвет")}
          </Text>
          <View style={styles.pillsContainer}>
            {COLORS.map((hex) => {
              const isActive = (draft.colors || []).includes(hex);
              return (
                <TouchableOpacity
                  key={hex}
                  onPress={() => toggleItem("colors", hex)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: hex,
                      borderColor: isActive ? colors.accent : colors.border,
                      borderWidth: isActive ? 3 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>
        </ScrollView>

        {/* КНОПКА ПРИМЕНИТЬ */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleApply}
            style={[styles.applyBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.applyBtnText}>
              {t("apply_filters", "Применить")}
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
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceRow: { flexDirection: "row", gap: 12 },
  priceInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorCircle: { width: 40, height: 40, borderRadius: 20 },
  footer: { padding: 16, borderTopWidth: 1 },
  applyBtn: { padding: 16, borderRadius: 12, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
