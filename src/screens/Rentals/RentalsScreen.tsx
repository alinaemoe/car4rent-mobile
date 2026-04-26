import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useMyRentals, Rental } from "@/src/api/queries/useRentals";
import { RentalCard } from "./components/RentalCard/RentalCard";
import { ReviewBottomSheet } from "./components/ReviewBottomSheet";

type TabType = "UPCOMING" | "ACTIVE" | "HISTORY";

export default function RentalsScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("UPCOMING");

  const reviewSheetRef = useRef<BottomSheetModal>(null);
  const [selectedRentalForReview, setSelectedRentalForReview] =
    useState<Rental | null>(null);

  const { data: rentals, isLoading, isRefetching, refetch } = useMyRentals();

  // Фильтрация "на лету"
  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    switch (activeTab) {
      case "UPCOMING":
        return rentals.filter(
          (r) => r.status === "CREATED" || r.status === "APPROVED",
        );
      case "ACTIVE":
        return rentals.filter((r) => r.status === "ACTIVE");
      case "HISTORY":
        return rentals.filter(
          (r) =>
            r.status === "COMPLETED" ||
            r.status === "CANCELED" ||
            r.status === "REJECTED" ||
            r.status === "OVERDUE",
        );
      default:
        return [];
    }
  }, [rentals, activeTab]);

  // Заглушка для пустого списка
  const renderEmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t("rentals.empty", "Сейчас у вас нет поездок в этой категории.")}
        </Text>
      </View>
    );
  };

  const handleOpenReview = (rental: Rental) => {
    setSelectedRentalForReview(rental);
    reviewSheetRef.current?.present();
  };

  return (
    // Убрали SafeAreaView, так как нативный хедер табов сам делает отступ
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* КАСТОМНЫЙ SEGMENTED CONTROL */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {(["UPCOMING", "ACTIVE", "HISTORY"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            let label = "";
            if (tab === "UPCOMING")
              label = t("rentals.tab_upcoming", "Предстоящие");
            if (tab === "ACTIVE") label = t("rentals.tab_active", "В поездке");
            if (tab === "HISTORY") label = t("rentals.tab_history", "История");

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isActive ? colors.surface : "transparent",
                  },
                  isActive && {
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive
                        ? colors.textPrimary
                        : colors.textSecondary,
                      fontWeight: isActive ? "bold" : "500",
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* СПИСОК КАРТОЧЕК */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredRentals}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={({ item }) => (
            <RentalCard
              rental={item}
              onPress={() => {
                router.push({
                  pathname: "/rental/[id]",
                  params: { id: item.id },
                });
              }}
              onReviewPress={() => handleOpenReview(item)} // 👈 Прокидываем функцию открытия!
              onBookAgainPress={() => {
                // Кидаем юзера на страницу авто, чтобы он забронировал снова
                router.push(`/car/${item.car.id}`);
              }}
              onFindOtherPress={() => {
                // Кидаем юзера в каталог
                router.push("/(drawer)/(tabs)");
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
        />
      )}
      <ReviewBottomSheet
        ref={reviewSheetRef}
        rental={selectedRentalForReview}
        onClose={() => reviewSheetRef.current?.dismiss()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: {
    paddingTop: 12, // 👈 Чуть отодвигаем табы от нижнего края хедера
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40, // Отступ под последней карточкой
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
