import React, { useCallback, forwardRef } from "react";
import { StyleSheet, Text } from "react-native";
import {
  BottomSheetModal, // 👈 ИСПОЛЬЗУЕМ MODAL
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";

interface Props {
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
}

// 👈 Типизируем ref как BottomSheetModal
export const AppBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ title, children, snapPoints = ["40%"] }, ref) => {
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
      <BottomSheetModal // 👈 ИСПОЛЬЗУЕМ MODAL
        ref={ref}
        index={0} // 👈 Для модалки 0 означает первый snapPoint (открыто)
        snapPoints={snapPoints}
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
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
