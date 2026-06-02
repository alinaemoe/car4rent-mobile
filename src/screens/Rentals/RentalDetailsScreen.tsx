import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCancelRental, useMyRentals } from "@/src/api/queries/useRentals";
import { Toast } from "@/src/components/Toast";
import { AlertDialog } from "@/src/components/Alert";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useTranslation } from "react-i18next";

import { CarLocation } from "@/src/screens/CarDetail/components/CarLocation"; // 👈 Переиспользуем из деталей машины!
import { RentalReceiptCard } from "./components/RentalDetails/RentalReceiptCard";
import { RentalStatusCard } from "./components/RentalDetails/RentalStatusCard";

export default function RentalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();

  // Достаем все брони и ищем нужную
  const { data: rentals, isLoading } = useMyRentals();
  const { mutate: cancelRental, isPending: isCanceling } = useCancelRental();

  const rental = useMemo(() => {
    return rentals?.find((r) => r.id.toString() === id);
  }, [rentals, id]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!rental) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>
          {t("rental_details.not_found", "Поездка не найдена")}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.accent, fontWeight: "bold" }}>
            {t("common.go_back", "Вернуться назад")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCancelPress = () => {
    AlertDialog.alert(
      t("rental_details.cancel_title", "Отмена бронирования"),
      t(
        "rental_details.cancel_msg",
        "Вы уверены, что хотите отменить эту поездку? Действие нельзя отменить.",
      ),
      [
        {
          text: t("rental_details.cancel_no", "Нет, оставить"),
          style: "cancel",
        },
        {
          text: t("rental_details.cancel_yes", "Да, отменить"),
          style: "destructive",
          onPress: () => {
            cancelRental(rental.id, {
              onSuccess: () => {
                Toast.success(
                  t("common.done", "Готово"),
                  t("rental_details.cancel_success", "Бронирование отменено"),
                );
                router.back(); // Возвращаем в список
              },
              onError: (err: any) => {
                Toast.error(
                  t("common.error", "Ошибка"),
                  err.response?.data?.message ||
                    t("rental_details.cancel_error", "Не удалось отменить"),
                );
              },
            });
          },
        },
      ],
    );
  };

  const showCancelButton =
    rental.status === "CREATED" || rental.status === "APPROVED";

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* 1. СТИККИ ХЕДЕР */}
      <SafeAreaView
        edges={["top"]}
        style={{
          backgroundColor: colors.background,
          zIndex: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        }}
      >
        <View style={styles.stickyHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-back-outline"
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {t("rental_details.header_title", "Детали поездки")}
          </Text>
        </View>
      </SafeAreaView>

      {/* 2. СКРОЛЛ КОНТЕНТА */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: showCancelButton ? 120 : 40,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        <RentalStatusCard rental={rental} />

        <CarLocation location={rental.car.location} />

        <RentalReceiptCard rental={rental} />
      </ScrollView>

      {/* 3. СТИККИ ФУТЕР (Кнопка отмены) */}
      {showCancelButton && (
        <View
          style={[
            styles.stickyFooter,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: colors.errorBg }]}
            onPress={handleCancelPress}
            disabled={isCanceling}
          >
            {isCanceling ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={[styles.cancelBtnText, { color: colors.error }]}>
                {t("rental_details.cancel_btn", "Отменить бронирование")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  stickyHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
  },
  backBtn: {
    justifyContent: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 17,
    fontWeight: "bold",
  },
});
