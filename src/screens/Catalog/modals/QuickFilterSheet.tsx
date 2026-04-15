import React, { forwardRef } from "react";
import { View, Text } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AppBottomSheet } from "@/src/components/AppBottomSheet";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { QUICK_FILTERS } from "../constants";

interface Props {
  activeFilterId: string | null;
}

export const QuickFilterSheet = forwardRef<BottomSheetModal, Props>(
  ({ activeFilterId }, ref) => {
    const colors = useAppColors();
    const title =
      QUICK_FILTERS.find((f) => f.id === activeFilterId)?.label || "Фильтр";

    return (
      <AppBottomSheet ref={ref} title={title} snapPoints={["40%", "60%"]}>
        <View style={{ padding: 16 }}>
          {activeFilterId === "price" && (
            <Text style={{ color: colors.textPrimary }}>
              Здесь будет крутой слайдер цены
            </Text>
          )}
          {activeFilterId === "brand" && (
            <Text style={{ color: colors.textPrimary }}>
              Здесь будет список брендов с чекбоксами
            </Text>
          )}
          {activeFilterId === "body_type" && (
            <Text style={{ color: colors.textPrimary }}>
              Здесь будет выбор типа кузова
            </Text>
          )}
        </View>
      </AppBottomSheet>
    );
  },
);
QuickFilterSheet.displayName = "QuickFilterSheet";
