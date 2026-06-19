import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector } from "@/src/store";
import { selectIsLessor, selectIsGuest } from "@/src/store/slices/authSlice";
import { useMyCars } from "@/src/api/queries/useLessorCars";
import { useCarRentalsHistory } from "@/src/api/queries/useCarRentalsHistory";

// Импорт наших компонентов
import { CarHeaderInfo } from "./components/CarHeaderInfo";
import { CarEarningsWidget } from "./components/CarEarningsWidget";
import { RentalHistoryCard } from "./components/RentalHistoryCard";

interface Props {
  carId: number;
}

export default function CarStatsScreen({ carId }: Props) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isLessor = useAppSelector(selectIsLessor);
  const isGuest = useAppSelector(selectIsGuest);
  const canAccess = isLessor && !isGuest;

  // 1. Ищем машину в уже закэшированном списке "Мои машины"
  const { data: cars = [] } = useMyCars({ enabled: canAccess });
  const car = useMemo(() => cars.find((c) => c.id === carId), [cars, carId]);

  // 2. Тянем историю аренд с бэкенда
  const { data: rentals = [], isLoading: rentalsLoading } =
    useCarRentalsHistory(carId);

  if (!canAccess) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
          {t("stats.no_access", "Доступ запрещён")}
        </Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={rentals}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        // ШАПКА: Информация об авто + Финансовые виджеты
        ListHeaderComponent={
          <>
            <CarHeaderInfo car={car} />
            <CarEarningsWidget rentals={rentals} />
            <Text style={[styles.listTitle, { color: colors.textPrimary }]}>
              {t("stats.rental_history", "История поездок")}
            </Text>
          </>
        }
        // ПУСТОЙ СПИСОК
        ListEmptyComponent={
          rentalsLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.accent}
              style={{ marginTop: 32 }}
            />
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("stats.no_rentals", "У этого автомобиля еще не было поездок.")}
            </Text>
          )
        }
        // КАРТОЧКА АРЕНДЫ
        renderItem={({ item }) => <RentalHistoryCard rental={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 15,
  },
});
