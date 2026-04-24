import React, { forwardRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Calendar } from "react-native-calendars";
import { useTranslation } from "react-i18next";
import { AppBottomSheet } from "@/src/components/AppBottomSheet";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
// Обязательно импортируем файл с конфигурацией локали
import "../constants";

interface Props {
  markedDates: any;
  onDayPress: (day: any) => void;
  onClear: () => void;
}

export const CalendarSheet = forwardRef<BottomSheetModal, Props>(
  ({ markedDates, onDayPress, onClear }, ref) => {
    const colors = useAppColors();
    const { t } = useTranslation();
    const hasSelectedDates = Object.keys(markedDates).length > 0;

    return (
      <AppBottomSheet
        ref={ref}
        title={t("select_dates_title", "Период аренды")}
        snapPoints={["65%", "90%"]} // Чуть увеличили минимальную высоту под кнопку
      >
        <View style={{ flex: 1, paddingBottom: 24 }}>
          <Calendar
            markingType={"period"}
            markedDates={markedDates}
            onDayPress={onDayPress}
            minDate={new Date().toISOString().split("T")[0]}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.accent,
              selectedDayTextColor: "#ffffff",
              todayTextColor: colors.accent,
              dayTextColor: colors.textPrimary,
              textDisabledColor: colors.border,
              arrowColor: colors.accent,
              monthTextColor: colors.textPrimary,
            }}
          />

          {/* 👇 КРАСИВАЯ КНОПКА СБРОСА */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.clearBtn,
                {
                  backgroundColor: hasSelectedDates
                    ? `${colors.error}15`
                    : colors.background,
                },
              ]}
              onPress={onClear}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.clearBtnText,
                  {
                    color: hasSelectedDates
                      ? colors.error
                      : colors.textSecondary,
                  },
                ]}
              >
                {hasSelectedDates
                  ? t("clear_dates", "Сбросить даты")
                  : t("dates_unknown", "Даты пока не известны")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppBottomSheet>
    );
  },
);

CalendarSheet.displayName = "CalendarSheet";

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  clearBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
