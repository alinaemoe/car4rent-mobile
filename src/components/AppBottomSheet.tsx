// src/components/AppBottomSheet.tsx
import React, { useCallback, forwardRef } from "react";
import { StyleSheet, Text } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[]; // Оставляем для совместимости, но сделаем опциональным
}

export const AppBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ title, children, snapPoints }, ref) => {
    const colors = useAppColors();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        // 👇 МАГИЯ ДИНАМИЧЕСКОЙ ВЫСОТЫ
        snapPoints={snapPoints || []}
        enableDynamicSizing={!snapPoints} // Если snapPoints не передали, подстраиваемся под контент
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
        backgroundStyle={{ backgroundColor: colors.surface }}
      >
        <BottomSheetView style={styles.contentContainer}>
          {title && (
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {title}
            </Text>
          )}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
AppBottomSheet.displayName = "AppBottomSheet";

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: 40, // Отступ снизу для безопасной зоны на iPhone
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
