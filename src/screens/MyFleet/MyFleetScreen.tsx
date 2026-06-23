import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
// 👇 Импортируем SafeAreaView и Insets
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Хуки
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useRefetchOnFocus } from "@/src/hooks/useRefetchOnFocus";
import { useAppSelector } from "@/src/store";
import { selectIsLessor } from "@/src/store/slices/authSlice";
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
import { Toast } from "@/src/components/Toast";

// Компоненты
import { FinancialWidget } from "./components/FinancialWidget";
import { LessorCarCard } from "./components/LessorCarCard";
import { RequestCard } from "./components/RequestCard";
import { Skeleton } from "@/src/components/common/Skeleton";

export default function MyFleetScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { t } = useTranslation();
  const isLessor = useAppSelector(selectIsLessor);

  // insets нужен только для нижнего отступа (FAB и подбородок iPhone)
  const insets = useSafeAreaInsets();
  const { width: layoutWidth } = useWindowDimensions(); // Ширина экрана для свайпов
  const scrollViewRef = useRef<ScrollView>(null);

  // Стейт табов: 0 - Мои автомобили, 1 - Заявки
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [refreshing, setRefreshing] = useState(false);

  // === FETCH DATA (только для лесоров) ===
  const {
    data: cars = [],
    isLoading: carsLoading,
    refetch: refetchCars,
  } = useMyCars({ enabled: isLessor });
  const {
    data: requests = [],
    isLoading: requestsLoading,
    refetch: refetchReqs,
  } = useMyRequests({ enabled: isLessor });
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useLessorStats(undefined, undefined, { enabled: isLessor });

  const { mutate: toggleVisibility } = useToggleCarVisibility();
  const { mutate: deleteRequest } = useDeleteRequest();

  // Свежие данные при каждом заходе на экран (фокус): и машины, и заявки,
  // и финансы. Иначе только что одобренная заявка/созданная машина висят
  // со старым статусом до ручного pull-to-refresh.
  const refetchAll = useCallback(() => {
    if (!isLessor) return;
    refetchCars();
    refetchReqs();
    refetchStats();
  }, [isLessor, refetchCars, refetchReqs, refetchStats]);

  useRefetchOnFocus(refetchAll);

  const isLoading = carsLoading || requestsLoading || statsLoading;
  const hasCars = cars.length > 0;

  // Доступ только для лесоров — guard после всех хуков
  if (!isLessor) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, styles.accessDeniedContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.accessDeniedIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.textSecondary} />
        </View>
        <Text style={[styles.accessDeniedTitle, { color: colors.textPrimary }]}>
          {t("fleet.access_denied_title", "Только для партнёров")}
        </Text>
        <Text style={[styles.accessDeniedSubtitle, { color: colors.textSecondary }]}>
          {t("fleet.access_denied_subtitle", "Этот раздел доступен только арендодателям. Подайте заявку на партнёрство, чтобы начать зарабатывать.")}
        </Text>
        <TouchableOpacity
          style={[styles.accessDeniedBtn, { backgroundColor: colors.accent }]}
          onPress={() => router.push("/partner-request")}
        >
          <Ionicons name="rocket-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.accessDeniedBtnText}>
            {t("fleet.become_partner_btn", "Стать партнёром")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // === HANDLERS ===
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCars(), refetchReqs(), refetchStats()]);
    setRefreshing(false);
  }, [refetchCars, refetchReqs, refetchStats]);

  const handleToggleCar = (carId: number, isVisible: boolean) =>
    toggleVisibility({ carId, isVisible });
  const handleDeleteRequest = (requestId: number) =>
    deleteRequest(requestId, {
      onSuccess: () =>
        Toast.success(
          t("fleet.request_deleted", "Заявка удалена"),
          t(
            "fleet.request_deleted_msg",
            "Вы можете подать новую заявку в любой момент",
          ),
        ),
      onError: (error: any) =>
        Toast.error(
          t("common.error", "Ошибка"),
          error.response?.data?.message,
        ),
    });
  const handleFabPress = () => router.push("/partner-request");

  // Перезапрос данных под выбранную вкладку (0 — авто, 1 — заявки)
  const refetchForTab = useCallback(
    (index: 0 | 1) => {
      if (!isLessor) return;
      if (index === 0) refetchCars();
      else refetchReqs();
      refetchStats();
    },
    [isLessor, refetchCars, refetchReqs, refetchStats],
  );

  // 👇 Хендлеры для Свайпов и Табов
  const handleTabPress = (index: 0 | 1) => {
    setActiveTab(index);
    // Прокручиваем ScrollView до нужной страницы
    scrollViewRef.current?.scrollTo({ x: index * layoutWidth, animated: true });
    refetchForTab(index); // свежие данные при тапе по табу
  };

  const handleMomentumScrollEnd = (e: any) => {
    // Вычисляем текущую страницу после окончания свайпа
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / layoutWidth) as 0 | 1;
    if (activeTab !== newIndex) {
      setActiveTab(newIndex);
      refetchForTab(newIndex); // свежие данные при свайпе на таб
    }
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
          onPress={() => handleTabPress(0)}
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
          onPress={() => handleTabPress(1)}
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
            {requests.length > 0 && (
              <Text style={{ color: colors.accent }}> • {requests.length}</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSkeletons = () => (
    <View style={{ marginTop: 16 }}>
      {[1, 2, 3].map((key) => (
        <View
          key={key}
          style={[styles.skeletonCard, { backgroundColor: colors.surface }]}
        >
          <Skeleton style={styles.skeletonImage} borderRadius={32} />
          <View style={{ flex: 1 }}>
            <Skeleton style={{ width: 80, height: 20, marginBottom: 8 }} />
            <Skeleton style={{ width: 140, height: 24, marginBottom: 8 }} />
            <Skeleton style={{ width: 100, height: 16 }} />
          </View>
          <Skeleton style={{ width: 50, height: 30, borderRadius: 16 }} />
        </View>
      ))}
    </View>
  );

  return (
    // 👇 SafeAreaView для защиты челки. Указываем только edges={['top']}
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Фиксированные табы под статус-баром */}
      {renderTabSelector()}

      {/* 👇 ГОРИЗОНТАЛЬНЫЙ СВАЙПЕР */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        // Чтобы скролл не дергался на Android
        overScrollMode="never"
        bounces={false}
      >
        {/* ========================================== */}
        {/* СТРАНИЦА 1: МОИ АВТОМОБИЛИ                 */}
        {/* ========================================== */}
        <View style={{ width: layoutWidth }}>
          <FlatList
            data={isLoading ? [] : cars}
            keyExtractor={(item) => `car-${item.id}`}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            }
            // Финансовый виджет живет в шапке этого списка
            ListHeaderComponent={
              isLoading ? (
                <Skeleton
                  style={[
                    styles.skeletonWidget,
                    { marginHorizontal: 16, marginTop: 8 },
                  ]}
                  borderRadius={24}
                />
              ) : hasCars ? (
                <FinancialWidget
                  totalEarned={stats?.total_earned_month || 0}
                  pendingPayout={stats?.pending_payout || 0}
                  month={new Date().getMonth() + 1}
                  year={new Date().getFullYear()}
                  onMonthSelectPress={() => console.log("Селектор месяца")}
                  onWidgetPress={() => router.push("/transaction-history")}
                />
              ) : null
            }
            ListEmptyComponent={
              isLoading ? (
                renderSkeletons()
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="car-sport-outline"
                    size={64}
                    color={colors.border}
                  />
                  <Text
                    style={[styles.emptyTitle, { color: colors.textPrimary }]}
                  >
                    {t("fleet.empty.cars_title", "Ваш автопарк пуст")}
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t(
                      "fleet.empty.cars_sub",
                      "Добавьте свой первый автомобиль, чтобы начать зарабатывать.",
                    )}
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <LessorCarCard
                car={item as unknown as MyCar}
                onPress={(id) => router.push(`/car-stats/${id}` as Href)}
                onToggleVisibility={handleToggleCar}
              />
            )}
          />
        </View>

        {/* ========================================== */}
        {/* СТРАНИЦА 2: ЗАЯВКИ                         */}
        {/* ========================================== */}
        <View style={{ width: layoutWidth }}>
          <FlatList
            data={isLoading ? [] : requests}
            keyExtractor={(item) => `req-${item.id}`}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: insets.bottom + 80,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            }
            ListEmptyComponent={
              isLoading ? (
                renderSkeletons()
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={64}
                    color={colors.border}
                  />
                  <Text
                    style={[styles.emptyTitle, { color: colors.textPrimary }]}
                  >
                    {t("fleet.empty.requests_title", "Нет активных заявок")}
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t(
                      "fleet.empty.requests_sub",
                      "Здесь будут отображаться заявки на добавление новых автомобилей.",
                    )}
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <RequestCard
                request={item as unknown as PartnershipRequest}
                onDelete={handleDeleteRequest}
              />
            )}
          />
        </View>
      </ScrollView>

      {/* FLOATING ACTION BUTTON (FAB) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleFabPress}
        style={[
          styles.fab,
          {
            backgroundColor: colors.accent,
            bottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
          },
        ]}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // --- TABS ---
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12, // Даем немного воздуха под SafeArea
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
    paddingTop: 80,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // --- SKELETONS ---
  skeletonWidget: {
    height: 140,
    marginBottom: 16,
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  skeletonImage: {
    width: 64,
    height: 64,
    marginRight: 14,
  },
  // --- ACCESS DENIED ---
  accessDeniedContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  accessDeniedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  accessDeniedSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  accessDeniedBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  accessDeniedBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
