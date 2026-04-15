import React, { forwardRef } from "react";
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
}

export const CalendarSheet = forwardRef<BottomSheetModal, Props>(
  ({ markedDates, onDayPress }, ref) => {
    const colors = useAppColors();
    const { t } = useTranslation();

    return (
      <AppBottomSheet
        ref={ref}
        title={t("select_dates_title", "Период аренды")}
        snapPoints={["60%", "90%"]}
      >
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
      </AppBottomSheet>
    );
  },
);

CalendarSheet.displayName = "CalendarSheet";
