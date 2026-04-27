import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

// Хуки и Стор
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { applyFilters } from "@/src/store/slices/filtersSlice";
import { selectFavoriteCarIds } from "@/src/store/slices/favoritesSlice";
import { useCarsCatalog } from "@/src/api/queries/useCars";

// Компоненты UI (глобальные и локальные)
import { CarCard } from "@/src/components/CarCard";
import { FiltersModal } from "@/src/components/FiltersModal";
import { CatalogHeader } from "@/src/screens/Catalog/components/CatalogHeader";
import { CatalogListHeader } from "@/src/screens/Catalog/components/CatalogListHeader";
import { MapFab } from "@/src/screens/Catalog/components/MapFab";

// Модалки
import { CalendarSheet } from "@/src/screens/Catalog/modals/CalendarSheet";
import { SortSheet } from "@/src/screens/Catalog/modals/SortSheet";
import { QuickFilterSheet } from "@/src/screens/Catalog/modals/QuickFilterSheet";

export default function CatalogScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const favoriteIds = useAppSelector(selectFavoriteCarIds);

  // Рефы для шторок
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const calendarSheetRef = useRef<BottomSheetModal>(null);
  const quickFilterSheetRef = useRef<BottomSheetModal>(null);

  // Стейты UI
  const [isFiltersVisible, setFiltersVisible] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null,
  );

  // Стейт Календаря
  const [markedDates, setMarkedDates] = useState<any>({});
  const [tempStart, setTempStart] = useState<string | null>(null);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      // Если в Redux есть полный диапазон дат (выбрали на другом экране)
      let newMarked: any = {
        [filters.startDate]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
        [filters.endDate]: {
          endingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      };

      let curr = new Date(filters.startDate);
      curr.setDate(curr.getDate() + 1);
      const end = new Date(filters.endDate);

      while (curr < end) {
        const dateStr = curr.toISOString().split("T")[0];
        newMarked[dateStr] = {
          color: `${colors.accent}30`, // 👈 МЕНЯЕМ ЗДЕСЬ
          textColor: colors.textPrimary,
        };
        curr.setDate(curr.getDate() + 1);
      }

      setMarkedDates(newMarked);
      setTempStart(filters.startDate); // Чтобы логика кликов не ломалась
    } else if (filters.startDate && !filters.endDate) {
      // Если в Redux только старт
      setMarkedDates({
        [filters.startDate]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      });
      setTempStart(filters.startDate);
    } else {
      // Если в Redux дат нет (сбросили)
      setMarkedDates({});
      setTempStart(null);
    }
  }, [filters.startDate, filters.endDate, colors]);

  // React Query
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useCarsCatalog();

  const rawCars = data?.pages.flatMap((page) => page.data) || [];

  // 2. 🔥 ПРЕДОХРАНИТЕЛЬ: Убираем дубликаты по ID (чтобы FlatList никогда не зависал)
  const cars = Array.from(
    new Map(rawCars.map((car) => [car.id, car])).values(),
  );

  // Хэндлеры открытия/действий
  const handleOpenSort = () => sortSheetRef.current?.present();
  const handleOpenCalendar = () => calendarSheetRef.current?.present();
  const handleOpenQuickFilter = (filterId: string) => {
    setActiveQuickFilter(filterId);
    quickFilterSheetRef.current?.present();
  };

  const handleSelectSort = (sortBy: string) => {
    dispatch(applyFilters({ sort_by: sortBy }));
  };

  const handleToggleFavorites = () => {
    dispatch(applyFilters({ onlyFavorites: !filters.onlyFavorites }));
  };

  // Логика календаря
  const handleDayPress = (day: any) => {
    const dateString = day.dateString;

    if (!tempStart || (filters.startDate && filters.endDate)) {
      setTempStart(dateString);
      dispatch(applyFilters({ startDate: dateString, endDate: null }));
      setMarkedDates({
        [dateString]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      });
    } else if (tempStart && !filters.endDate) {
      if (new Date(dateString) < new Date(tempStart)) {
        setTempStart(dateString);
        dispatch(applyFilters({ startDate: dateString, endDate: null }));
        setMarkedDates({
          [dateString]: {
            startingDay: true,
            color: colors.accent,
            textColor: "white",
          },
        });
        return;
      }

      dispatch(applyFilters({ endDate: dateString }));
      let newMarked: any = {
        [tempStart]: {
          startingDay: true,
          color: colors.accent,
          textColor: "white",
        },
        [dateString]: {
          endingDay: true,
          color: colors.accent,
          textColor: "white",
        },
      };

      let curr = new Date(tempStart);
      curr.setDate(curr.getDate() + 1);
      const end = new Date(dateString);

      while (curr < end) {
        const dateStr = curr.toISOString().split("T")[0];
        newMarked[dateStr] = {
          color: `${colors.accent}30`, // 👈 И МЕНЯЕМ ЗДЕСЬ
          textColor: colors.textPrimary,
        };
        curr.setDate(curr.getDate() + 1);
      }

      setMarkedDates(newMarked);
      setTimeout(() => calendarSheetRef.current?.dismiss(), 500);
    }
  };

  const handleClearDates = () => {
    // 1. Очищаем локальные стейты календаря
    setTempStart(null);
    setMarkedDates({});

    // 2. Затираем даты в Redux (применяем null)
    dispatch(applyFilters({ startDate: null, endDate: null }));

    // 3. Закрываем шторку
    calendarSheetRef.current?.dismiss();
  };

  // ЗАГЛУШКА ДЛЯ ПУСТОГО СПИСКА
  const renderEmptyComponent = () => {
    if (filters.onlyFavorites) {
      return (
        <View
          style={{ alignItems: "center", marginTop: 60, paddingHorizontal: 32 }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="heart-dislike-outline"
              size={40}
              color={colors.textSecondary}
            />
          </View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Нет избранных машин
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Вы еще ничего не добавили в избранное. Нажимайте на сердечко у
            понравившихся автомобилей.
          </Text>
        </View>
      );
    }

    return (
      <Text
        style={{
          color: colors.textSecondary,
          textAlign: "center",
          marginTop: 40,
          fontSize: 16,
        }}
      >
        {t("catalog_empty", "Машины не найдены")}
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CatalogHeader
        startDate={filters.startDate}
        endDate={filters.endDate}
        onOpenCalendar={handleOpenCalendar}
        onOpenFilters={() => setFiltersVisible(true)}
      />

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          ListHeaderComponent={
            <CatalogListHeader
              carsCount={cars.length}
              isFavoritesOnly={!!filters.onlyFavorites}
              onToggleFavorites={handleToggleFavorites}
              onOpenQuickFilter={handleOpenQuickFilter}
              onOpenSort={handleOpenSort}
              // ❌ Удалили activeCarClass и onSelectCarClass, так как CatalogListHeader теперь умный
            />
          }
          renderItem={({ item }) => (
            <CarCard
              car={item}
              // 👇 ПУШИМ НА СТРАНИЦУ МАШИНЫ, ПЕРЕДАВАЯ ЕЁ ID В URL
              onPress={() => {
                // 👇 Используем объектный синтаксис для Expo Router
                router.push({
                  pathname: "/car/[id]",
                  params: { id: item.id },
                });
              }}
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={{ marginVertical: 16 }}
                color={colors.accent}
              />
            ) : null
          }
          ListEmptyComponent={renderEmptyComponent}
        />
      )}

      <MapFab />

      {/* Модалки и Шторки */}
      <QuickFilterSheet
        ref={quickFilterSheetRef}
        activeFilterId={activeQuickFilter}
      />
      <SortSheet ref={sortSheetRef} onSelectSort={handleSelectSort} />
      <CalendarSheet
        ref={calendarSheetRef}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onClear={handleClearDates}
      />
      <FiltersModal
        visible={isFiltersVisible}
        onClose={() => setFiltersVisible(false)}
      />
    </View>
  );
}
