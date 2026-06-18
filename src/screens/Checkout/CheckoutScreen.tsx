import React, { useCallback, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { applyFilters } from "@/src/store/slices/filtersSlice";
import { updateUser } from "@/src/store/slices/authSlice";
import { useCarDetail } from "@/src/api/queries/useCars";
import { usePriceCalculator } from "@/src/hooks/usePriceCalculator";
import { axiosInstance } from "@/src/api/axios-instance";
import { Toast } from "@/src/components/Toast"; // 👈 НАШ НОВЫЙ СЕРВИС ТОСТОВ!
import { AppBottomSheet } from "@/src/components/AppBottomSheet";

import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutMiniCar } from "./components/CheckoutMiniCar";
import { CheckoutForm } from "./components/CheckoutForm";
import { CheckoutSummary } from "./components/CheckoutSummary";
import { CheckoutFooter } from "./components/CheckoutFooter";

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Достаем даты и статус документов из Redux
  const { startDate, endDate } = useAppSelector((state) => state.filters);
  const isDocumentsVerified = useAppSelector(
    (state) => state.auth.user?.is_documents_verified ?? false,
  );

  const { data: car, isLoading: isCarLoading } = useCarDetail(Number(id));
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Реф для шторки верификации
  const verificationSheetRef = useRef<BottomSheetModal>(null);

  // Авто-обновление статуса верификации при возврате с экрана загрузки доков
  useFocusEffect(
    useCallback(() => {
      if (!isDocumentsVerified) {
        axiosInstance
          .get("/users/profile")
          .then((res) => {
            dispatch(updateUser(res.data));
            // Если документы уже верифицированы — закрываем шторку
            if (res.data.is_documents_verified) {
              verificationSheetRef.current?.dismiss();
            }
          })
          .catch(() => {});
      }
    }, [isDocumentsVerified, dispatch]),
  );

  const {
    days,
    baseTotal,
    discountAmount,
    finalRentPrice,
    deposit,
    grandTotal,
  } = usePriceCalculator(car, startDate, endDate);

  // ФИНАЛИЗАЦИЯ БРОНИ
  const handleCreateRequest = async () => {
    // 1. ЖЕСТКИЙ СТОП: Проверяем доки
    if (!isDocumentsVerified) {
      verificationSheetRef.current?.present();
      return;
    }

    // 2. Валидация дат на клиенте
    if (!startDate || !endDate) {
      Toast.error(
        t("checkout.no_dates", "Даты не выбраны"),
        t("checkout.no_dates_msg", "Пожалуйста, выберите даты аренды"),
      );
      return;
    }
    if (new Date(startDate) <= new Date(new Date().toDateString())) {
      Toast.error(
        t("checkout.past_date", "Дата в прошлом"),
        t("checkout.past_date_msg", "Дата начала должна быть в будущем"),
      );
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      Toast.error(
        t("checkout.bad_range", "Некорректный диапазон"),
        t(
          "checkout.bad_range_msg",
          "Дата окончания должна быть позже даты начала",
        ),
      );
      return;
    }

    // 3. Отправляем запрос
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/rentals", {
        car_id: Number(id),
        start_date: startDate,
        end_date: endDate,
        // Бэкенд пока не принимает destination, но мы можем добавить его позже в DTO
      });

      // 4. Успех! Очищаем выбранные даты, чтобы каталог был чистым
      dispatch(applyFilters({ startDate: null, endDate: null }));

      // Invalidate car detail so booked dates reflect the new reservation,
      // and refresh my-rentals so the new booking appears immediately.
      queryClient.invalidateQueries({ queryKey: ["car", "detail", Number(id)] });
      queryClient.invalidateQueries({ queryKey: ["my-rentals"] });

      Toast.success(
        t("checkout.toast_success_title", "Отлично!"),
        t("checkout.toast_success_msg", "Ваш запрос отправлен владельцу."),
      );

      // 6. Редирект на экран успеха
      router.replace("/checkout/success");
    } catch (error: any) {
      // Обработка ошибки (помимо глобального интерсептора)
      Toast.error(
        t("checkout.toast_error_title", "Не удалось забронировать"),
        error.response?.data?.message || "Пожалуйста, попробуйте еще раз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCarLoading || !car)
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;

  const isFormValid = startDate && endDate;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <CheckoutHeader onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <CheckoutMiniCar car={car} />

        <View style={{ paddingHorizontal: 8, paddingTop: 16 }}>
          <CheckoutForm
            startDate={startDate}
            endDate={endDate}
            destination={destination}
            setDestination={setDestination}
          />

          <CheckoutSummary
            days={days}
            baseTotal={baseTotal}
            discountAmount={discountAmount}
            finalRentPrice={finalRentPrice}
            deposit={deposit}
            discountTiers={car.discount_tiers}
          />
        </View>
      </ScrollView>

      {/* Обязательно добавь проп isLoading в свой CheckoutFooter, чтобы кнопка крутилась */}
      <CheckoutFooter
        isFormValid={!!isFormValid}
        isLoading={isSubmitting} // 👈 Крутим спиннер во время запроса
        onSubmit={handleCreateRequest}
      />

      {/* 🛑 ШТОРКА ЖЕСТКОГО СТОПА (ВЕРИФИКАЦИЯ) */}
      <AppBottomSheet
        ref={verificationSheetRef}
        title={t("checkout.verify_title", "Остался один шаг!")}
        snapPoints={["55%"]}
      >
        <View style={styles.sheetContent}>
          <View
            style={[styles.iconWrapper, { backgroundColor: colors.warningBg }]}
          >
            <Ionicons name="id-card-outline" size={40} color={colors.warning} />
          </View>

          <Text style={[styles.sheetDesc, { color: colors.textPrimary }]}>
            {t(
              "checkout.verify_desc",
              "Для создания брони нам необходимо подтвердить вашу личность. Пожалуйста, загрузите фото паспорта и прав.",
            )}
          </Text>

          <TouchableOpacity
            style={[styles.sheetBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              verificationSheetRef.current?.dismiss();
              // Перекидываем на экран загрузки доков
              router.push("/(drawer)/upload-docs" as Href);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.sheetBtnText}>
              {t("checkout.verify_btn", "Пройти верификацию")}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sheetDesc: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  sheetBtn: {
    flexDirection: "row",
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
