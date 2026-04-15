import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Calendar, LocaleConfig } from "react-native-calendars";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector, useAppDispatch } from "@/src/store";
import { applyFilters } from "@/src/store/slices/filtersSlice";
import { useCarsCatalog } from "@/src/api/queries/useCars";

// ИМПОРТЫ КОМПОНЕНТОВ
import { CarCard } from "@/src/components/CarCard";
import { FiltersModal } from "@/src/components/FiltersModal";
import { AppBottomSheet } from "@/src/components/AppBottomSheet";

LocaleConfig.locales["ru"] = {
  monthNames: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ],
  monthNamesShort: [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ],
  dayNames: [
    "воскресенье",
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
  ],
  dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  today: "Сегодня",
};
LocaleConfig.defaultLocale = "ru";

// Обновляем массив таблеток, добавив им ID, чтобы понимать, какую шторку открывать
const QUICK_FILTERS = [
  { id: "brand", label: "Бренд" },
  { id: "price", label: "Цена" },
  { id: "discounts", label: "Скидки" },
  { id: "body_type", label: "Тип кузова" },
  { id: "no_deposit", label: "Без залога" },
];

const CAR_CLASSES = [
  {
    id: "ECONOMY",
    label: "Эконом",
    price: "от 2100 ₽",
    img: require("@/assets/images/icon.png"), // Замени на свои картинки
  },
  {
    id: "COMFORT",
    label: "Комфорт",
    price: "2100-3500 ₽",
    img: require("@/assets/images/icon.png"),
  },
  {
    id: "BUSINESS",
    label: "Бизнес",
    price: "от 5000 ₽",
    img: require("@/assets/images/icon.png"),
  },
];

export default function CatalogScreen() {
  const colors = useAppColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);

  // Стейты и Рефы для модалок (ОБЯЗАТЕЛЬНО BottomSheetModal)
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const calendarSheetRef = useRef<BottomSheetModal>(null);
  const quickFilterSheetRef = useRef<BottomSheetModal>(null); // 👈 НОВАЯ ШТОРКА ДЛЯ ТАБЛЕТОК

  const [isFiltersVisible, setFiltersVisible] = useState(false); // Для большой модалки
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null,
  ); // Какой быстрый фильтр открыт

  // Стейт Календаря
  const [markedDates, setMarkedDates] = useState<any>({});
  const [tempStart, setTempStart] = useState<string | null>(null);

  // React Query хук
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useCarsCatalog();

  // Плоский массив машин
  const cars = data?.pages.flatMap((page) => page.data) || [];

  // Хэндлеры открытия шторок
  const handleOpenSort = () => sortSheetRef.current?.present();
  const handleOpenCalendar = () => calendarSheetRef.current?.present();

  const handleOpenQuickFilter = (filterId: string) => {
    setActiveQuickFilter(filterId);
    quickFilterSheetRef.current?.present();
  };

  // Хэндлер выбора дат
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
          color: colors.surface,
          textColor: colors.textPrimary,
        };
        curr.setDate(curr.getDate() + 1);
      }

      setMarkedDates(newMarked);

      setTimeout(() => {
        calendarSheetRef.current?.dismiss();
      }, 500);
    }
  };

  // Выносим скроллящийся контент в заголовок списка
  const renderListHeader = () => (
    <View style={{ backgroundColor: colors.background, paddingBottom: 10 }}>
      {/* 2. БЛОК: ГОРИЗОНТАЛЬНЫЕ ТАБЛЕТКИ (QUICK FILTERS) */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingVertical: 12,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {QUICK_FILTERS.map((pill) => (
            <TouchableOpacity
              key={pill.id}
              style={[styles.quickPill, { backgroundColor: colors.surface }]}
              activeOpacity={0.8}
              onPress={() => handleOpenQuickFilter(pill.id)} // 👈 ОТКРЫВАЕТ ИНДИВИДУАЛЬНУЮ ШТОРКУ
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
                {pill.label}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={colors.textSecondary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. ТАБЫ КЛАССОВ (ЭКОНОМ, КОМФОРТ...) */}
      <View style={{ height: 130, marginTop: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {CAR_CLASSES.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() =>
                dispatch(applyFilters({ carClass: item.id as any }))
              }
              style={[
                styles.classCard,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    filters.carClass === item.id
                      ? colors.accent
                      : "transparent",
                },
              ]}
            >
              <Image
                source={item.img}
                style={styles.classImg}
                resizeMode="contain"
              />
              <Text style={{ color: colors.textPrimary, fontWeight: "bold" }}>
                {item.label}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                {item.price}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. КНОПКИ СОРТИРОВКИ И КОЛИЧЕСТВО */}
      <View style={styles.resultsRow}>
        <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>
          {t("found_cars", "Найдено")} {cars.length}
        </Text>
        <TouchableOpacity onPress={handleOpenSort} style={styles.sortBtn}>
          <Ionicons name="swap-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 1. УМНЫЙ ХЕДЕР (ЗАФИКСИРОВАН НАВЕРХУ) */}
      <View
        style={[
          styles.headerContainer,
          {
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingBottom: 12,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.dateInput, { backgroundColor: colors.surface }]}
          activeOpacity={0.8}
          onPress={handleOpenCalendar}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 15,
              fontWeight: "500",
            }}
          >
            {filters.startDate && filters.endDate
              ? `${filters.startDate} - ${filters.endDate}`
              : t("select_dates", "Выберите даты")}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.accent} />
        </TouchableOpacity>

        {/* 👈 КНОПКА ОТКРЫТИЯ БОЛЬШОЙ МОДАЛКИ */}
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.surface }]}
          onPress={() => setFiltersVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* 5. СПИСОК МАШИН */}
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
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <CarCard car={item} onPress={() => console.log("Car", item.id)} />
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
          ListEmptyComponent={
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
          }
        />
      )}

      {/* 6. ПЛАВАЮЩАЯ КНОПКА (FAB) КАРТЫ */}
      <TouchableOpacity
        style={[styles.mapFab, { backgroundColor: colors.accent }]}
        activeOpacity={0.9}
      >
        <Text style={styles.mapFabText}>{t("map", "Карта")}</Text>
        <Ionicons name="map-outline" size={20} color="#fff" />
      </TouchableOpacity>

      {/* --- ВСЕ ШТОРКИ И МОДАЛКИ НИЖЕ --- */}

      {/* ШТОРКА: БЫСТРЫЕ ФИЛЬТРЫ (ТАБЛЕТКИ) */}
      <AppBottomSheet
        ref={quickFilterSheetRef}
        title={
          QUICK_FILTERS.find((f) => f.id === activeQuickFilter)?.label ||
          "Фильтр"
        }
        snapPoints={["40%", "60%"]}
      >
        <View style={{ padding: 16 }}>
          {activeQuickFilter === "price" && (
            <Text style={{ color: colors.textPrimary }}>
              Здесь будет крутой слайдер цены
            </Text>
          )}
          {activeQuickFilter === "brand" && (
            <Text style={{ color: colors.textPrimary }}>
              Здесь будет список брендов с чекбоксами
            </Text>
          )}
          {activeQuickFilter === "body_type" && (
            <Text style={{ color: colors.textPrimary }}>
              Здесь будет выбор типа кузова
            </Text>
          )}
          {/* Пока заглушка. В будущем вынесем содержимое в отдельные компоненты */}
        </View>
      </AppBottomSheet>

      {/* ШТОРКА: СОРТИРОВКА */}
      <AppBottomSheet
        ref={sortSheetRef}
        title={t("sort_by", "Сортировка")}
        snapPoints={["35%"]}
      >
        <TouchableOpacity
          onPress={() => {
            dispatch(applyFilters({ sort_by: "price_asc" }));
            sortSheetRef.current?.dismiss();
          }}
          style={styles.sortOption}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            Сначала дешевле
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            dispatch(applyFilters({ sort_by: "price_desc" }));
            sortSheetRef.current?.dismiss();
          }}
          style={styles.sortOption}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            Сначала дороже
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            dispatch(applyFilters({ sort_by: "newest" }));
            sortSheetRef.current?.dismiss();
          }}
          style={styles.sortOption}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            Сначала новые
          </Text>
        </TouchableOpacity>
      </AppBottomSheet>

      {/* ШТОРКА: КАЛЕНДАРЬ */}
      <AppBottomSheet
        ref={calendarSheetRef}
        title={t("select_dates_title", "Период аренды")}
        snapPoints={["60%", "90%"]}
      >
        <Calendar
          markingType={"period"}
          markedDates={markedDates}
          onDayPress={handleDayPress}
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

      {/* БОЛЬШАЯ МОДАЛКА ФИЛЬТРОВ (открывается кнопкой в шапке) */}
      <FiltersModal
        visible={isFiltersVisible}
        onClose={() => setFiltersVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  dateInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  quickPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  classCard: {
    width: 140,
    height: 110,
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  classImg: { width: 80, height: 40, marginBottom: 8 },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 10,
    paddingTop: 10,
  },
  resultsTitle: { fontSize: 18, fontWeight: "bold" },
  sortBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  sortOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  mapFab: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  mapFabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
});
