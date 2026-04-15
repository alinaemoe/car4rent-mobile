import React, { forwardRef } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { AppBottomSheet } from "@/src/components/AppBottomSheet";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  onSelectSort: (sortBy: string) => void;
}

export const SortSheet = forwardRef<BottomSheetModal, Props>(
  ({ onSelectSort }, ref) => {
    const colors = useAppColors();
    const { t } = useTranslation();

    const handleSort = (type: string) => {
      onSelectSort(type);
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <AppBottomSheet
        ref={ref}
        title={t("sort_by", "Сортировка")}
        snapPoints={["35%"]}
      >
        <TouchableOpacity
          onPress={() => handleSort("price_asc")}
          style={styles.sortOption}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            Сначала дешевле
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSort("price_desc")}
          style={styles.sortOption}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            Сначала дороже
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSort("newest")}
          style={styles.sortOption}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            Сначала новые
          </Text>
        </TouchableOpacity>
      </AppBottomSheet>
    );
  },
);

// 👈 Добавляем displayName, чтобы React и TS не ругались
SortSheet.displayName = "SortSheet";

const styles = StyleSheet.create({
  sortOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
});
