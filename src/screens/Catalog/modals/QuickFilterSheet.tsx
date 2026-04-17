import React, { forwardRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AppBottomSheet } from "@/src/components/AppBottomSheet";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { applyFilters, FiltersState } from "@/src/store/slices/filtersSlice";
import { QUICK_FILTERS } from "../constants";

// 👇 Импортируем типы словарей
import { DictOption } from "@/src/types";

interface Props {
  activeFilterId: string | null;
}

export const QuickFilterSheet = forwardRef<BottomSheetModal, Props>(
  ({ activeFilterId }, ref) => {
    const colors = useAppColors();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    // Достаем активные фильтры и наши настройки (словари)
    const filters = useAppSelector((state) => state.filters);
    const { settings } = useAppSelector((state) => state.dictionaries);

    // Достаем массивы из словарей с фоллбэком на пустой массив
    const BRANDS: string[] = settings.POPULAR_BRANDS || [];
    const BODY_TYPES: DictOption[] = settings.DICT_BODY_TYPES || [];
    const TRANSMISSIONS: DictOption[] = settings.DICT_TRANSMISSIONS || [];

    const title =
      QUICK_FILTERS.find((f) => f.id === activeFilterId)?.label || "Фильтр";

    type ArrayKeys = keyof Pick<
      FiltersState,
      "brands" | "body_types" | "transmissions"
    >;

    const toggleItem = <K extends ArrayKeys>(
      key: K,
      value: FiltersState[K][number],
    ) => {
      const list = (filters[key] as any[]) || [];
      const isSelected = list.includes(value);

      dispatch(
        applyFilters({
          [key]: isSelected
            ? list.filter((item) => item !== value)
            : [...list, value],
        }),
      );
    };

    const renderOption = (
      label: string,
      isSelected: boolean,
      onPress: () => void,
    ) => (
      <TouchableOpacity
        style={[styles.optionRow, { borderBottomColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: isSelected ? colors.accent : colors.textPrimary,
            fontSize: 16,
            fontWeight: isSelected ? "600" : "400",
          }}
        >
          {label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={24} color={colors.accent} />
        )}
      </TouchableOpacity>
    );

    return (
      <AppBottomSheet ref={ref} title={title}>
        <View style={styles.container}>
          {/* 👇 Оборачиваем в ScrollView с ограничением по максимальной высоте */}
          <ScrollView
            style={{ maxHeight: 400 }} // Чтобы шторка не уехала в космос
            showsVerticalScrollIndicator={false}
          >
            {activeFilterId === "brand" && (
              <View>
                {BRANDS.map((brand) => (
                  <React.Fragment key={brand}>
                    {renderOption(brand, filters.brands.includes(brand), () =>
                      toggleItem("brands", brand),
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}

            {activeFilterId === "body_type" && (
              <View>
                {BODY_TYPES.map((type) => (
                  <React.Fragment key={type.id}>
                    {renderOption(
                      type.label, // 👈 Берем лейбл из словаря
                      filters.body_types.includes(type.id),
                      () => toggleItem("body_types", type.id),
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}

            {activeFilterId === "transmission" && (
              <View>
                {TRANSMISSIONS.map((type) => (
                  <React.Fragment key={type.id}>
                    {renderOption(
                      type.label, // 👈 Берем лейбл из словаря
                      filters.transmissions.includes(type.id),
                      () => toggleItem("transmissions", type.id),
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Кнопка "Готово" зафиксирована внизу под скроллом */}
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.accent }]}
            onPress={() => {
              if (ref && typeof ref !== "function" && ref.current) {
                ref.current.dismiss();
              }
            }}
          >
            <Text style={styles.doneText}>{t("done", "Готово")}</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>
    );
  },
);
QuickFilterSheet.displayName = "QuickFilterSheet";

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  doneButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
