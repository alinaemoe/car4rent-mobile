import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Хуки
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import {
  useMyCars,
  useToggleCarVisibility,
  MyCar,
} from "@/src/api/queries/useLessorCars";
import {
  useMyRequests,
  useDeleteRequest,
  PartnershipRequest,
} from "@/src/api/queries/usePartnershipRequests";
import { useLessorStats } from "@/src/api/queries/useLessorFinances";

// Компоненты
import { FinancialWidget } from "./components/FinancialWidget";
import { LessorCarCard } from "./components/LessorCarCard";
import { RequestCard } from "./components/RequestCard";

export default function MyFleetScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Стейт табов: 0 - Мои автомобили, 1 - Заявки
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [refreshing, setRefreshing] = useState(false);

  // === FETCH DATA ===
  const {
    data: cars = [],
    isLoading: carsLoading,
    refetch: refetchCars,
  } = useMyCars();
  const {
    data: requests = [],
    isLoading: requestsLoading,
    refetch: refetchReqs,
  } = useMyRequests();
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useLessorStats();

  const { mutate: toggleVisibility } = useToggleCarVisibility();
  const { mutate: deleteRequest } = useDeleteRequest();

  const isLoading = carsLoading || requestsLoading || statsLoading;
  const hasCars = cars.length > 0;

  // === HANDLERS ===
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCars(), refetchReqs(), refetchStats()]);
    setRefreshing(false);
  }, [refetchCars, refetchReqs, refetchStats]);

  const handleToggleCar = (carId: number, isVisible: boolean) => {
    toggleVisibility({ carId, isVisible });
  };

  const handleDeleteRequest = (requestId: number) => {
    deleteRequest(requestId);
  };

  const handleFabPress = () => {
    router.push("/partner-request"); // Переход на Wizard создания заявки
  };

  // === RENDERERS ===
  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <View style={[styles.tabSegmented, { backgroundColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 0 && {
              backgroundColor: colors.surface,
              shadowColor: "#000",
              elevation: 2,
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 1 },
            },
          ]}
          onPress={() => setActiveTab(0)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 0 ? colors.textPrimary : colors.textSecondary,
              },
            ]}
          >
            {t("fleet.tabs.cars", "Мои автомобили")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 1 && {
              backgroundColor: colors.surface,
              shadowColor: "#000",
              elevation: 2,
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 1 },
            },
          ]}
          onPress={() => setActiveTab(1)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 1 ? colors.textPrimary : colors.textSecondary,
              },
            ]}
          >
            {t("fleet.tabs.requests", "Заявки")}
            {/* Маленький бейдж, если есть заявки */}
            {requests.length > 0 && (
              <Text style={{ color: colors.accent }}> • {requests.length}</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    if (activeTab === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-sport-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {t("fleet.empty.cars_title", "Ваш автопарк пуст")}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t(
              "fleet.empty.cars_sub",
              "Добавьте свой первый автомобиль, чтобы начать зарабатывать.",
            )}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="document-text-outline"
          size={64}
          color={colors.border}
        />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          {t("fleet.empty.requests_title", "Нет активных заявок")}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {t(
            "fleet.empty.requests_sub",
            "Здесь будут отображаться заявки на добавление новых автомобилей.",
          )}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={activeTab === 0 ? cars : requests}
        // Хак: добавляем префикс, чтобы ключи машин и заявок не пересекались при смене табов
        keyExtractor={(item) => `${activeTab}-${item.id}`}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        // HEADER: Виджет + Табы
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {hasCars && (
              <FinancialWidget
                totalEarned={stats?.total_earned_month || 0}
                pendingPayout={stats?.pending_payout || 0}
                month={new Date().getMonth() + 1}
                year={new Date().getFullYear()}
                onMonthSelectPress={() =>
                  console.log("Открываем селектор месяца")
                }
                onWidgetPress={() => router.push("/transaction-history")}
              />
            )}
            {renderTabSelector()}
          </View>
        }
        // EMPTY STATE
        ListEmptyComponent={renderEmptyState}
        // ITEMS
        renderItem={({ item }) => {
          if (activeTab === 0) {
            const carItem = item as unknown as MyCar;
            return (
              <LessorCarCard
                car={carItem}
                // Приводим строку к Href, чтобы router.push не ругался
                onPress={(id) => router.push(`/car-stats/${id}` as Href)}
                onToggleVisibility={handleToggleCar}
              />
            );
          } else {
            const requestItem = item as unknown as PartnershipRequest;
            return (
              <RequestCard
                request={requestItem}
                onDelete={handleDeleteRequest}
              />
            );
          }
        }}
      />

      {/* FLOATING ACTION BUTTON (FAB) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleFabPress}
        style={[
          styles.fab,
          {
            backgroundColor: colors.accent,
            bottom: insets.bottom > 0 ? insets.bottom + 16 : 24, // Поднимаем над home bar iOS
          },
        ]}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  headerBlock: {
    marginBottom: 8,
  },
  // --- TABS ---
  tabContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabSegmented: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // --- EMPTY STATES ---
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  // --- FAB ---
  fab: {
    position: "absolute",
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    // Тень
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
