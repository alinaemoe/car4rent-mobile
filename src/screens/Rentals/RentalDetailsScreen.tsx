import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useMyRentals, useCancelRental } from "@/src/api/queries/useRentals";
import { Toast } from "@/src/components/Toast";

import { RentalStatusCard } from "./components/RentalDetails/RentalStatusCard";
import { RentalReceiptCard } from "./components/RentalDetails/RentalReceiptCard";
import { CarLocation } from "@/src/screens/CarDetail/components/CarLocation"; // 👈 Переиспользуем из деталей машины!

export default function RentalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();

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
        <Text style={{ color: colors.textSecondary }}>Поездка не найдена</Text>
        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.accent, fontWeight: "bold" }}>
            Вернуться назад
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Обработчик отмены
  const handleCancelPress = () => {
    Alert.alert(
      "Отмена бронирования",
      "Вы уверены, что хотите отменить эту поездку? Действие нельзя отменить.",
      [
        { text: "Нет, оставить", style: "cancel" },
        {
          text: "Да, отменить",
          style: "destructive",
          onPress: () => {
            cancelRental(rental.id, {
              onSuccess: () => {
                Toast.success("Готово", "Бронирование отменено");
                router.back(); // Возвращаем в список
              },
              onError: (err: any) => {
                Toast.error(
                  "Ошибка",
                  err.response?.data?.message || "Не удалось отменить",
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
            Детали поездки
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

        {/* Переиспользуем твой готовый блок Карты из CarDetails */}
        <CarLocation />

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
                Отменить бронирование
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
