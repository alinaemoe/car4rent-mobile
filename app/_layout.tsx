import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// 👇 НОВЫЕ ИМПОРТЫ ДЛЯ СТАТУС БАРА И SAFE AREA
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Appearance, useColorScheme } from "react-native";

import { store, useAppDispatch, useAppSelector } from "../src/store";
import {
  setCredentials,
  logout,
  setAppReady,
  setGuestMode,
} from "../src/store/slices/authSlice";
import { loadFavorites } from "@/src/store/slices/favoritesSlice";
import { fetchDictionaries } from "@/src/store/slices/dictionariesSlice";
import { storage } from "../src/utils/storage";
import { initI18n } from "@/src/utils/i18n";
import { fetchAndCacheTranslations } from "@/src/api/translations";
import { axiosInstance } from "../src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { ToastRoot } from "@/src/components/Toast";
import { AlertRoot } from "@/src/components/Alert";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAppReady, token, isGuest } = useAppSelector((state) => state.auth);

  // 👇 1. ДОБАВЛЯЕМ СЕЛЕКТОР ДЛЯ ЗАЩИТЫ: следим за словарями
  const { features } = useAppSelector((state) => state.dictionaries);

  const colors = useAppColors();
  const segments = useSegments();
  const router = useRouter();

  // --- ЭФФЕКТ 1: ПЕРВИЧНАЯ ИНИЦИАЛИЗАЦИЯ (срабатывает 1 раз при запуске) ---
  useEffect(() => {
    const initApp = async () => {
      try {
        await initI18n();
        fetchAndCacheTranslations();
        await dispatch(loadFavorites());
        await dispatch(fetchDictionaries());

        const accessToken = await storage.getAccessToken();
        const isGuestSaved = await storage.getGuestMode();

        if (accessToken) {
          const { data: user } = await axiosInstance.get("/users/profile");
          dispatch(setCredentials({ user, token: accessToken }));
        } else if (isGuestSaved) {
          dispatch(setGuestMode());
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Ошибка инициализации профиля:", error);
        dispatch(logout());
        await storage.removeTokens();
      } finally {
        dispatch(setAppReady());

        // Таймер на 3 секунды для красивого сплэша
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 3000);
      }
    };
    initApp();
  }, [dispatch]);

  // 👇 --- ЭФФЕКТ 2: ЗАЩИТА СЛОВАРЕЙ (Самовосстановление) --- 👇
  useEffect(() => {
    // Если приложение загрузилось, мы внутри (как юзер или гость), а словарей НЕТ:
    if (isAppReady && (token || isGuest) && features.length === 0) {
      console.log(
        "🛠 Защита сработала: словари пустые после логина! Докачиваем...",
      );
      dispatch(fetchDictionaries());
    }
  }, [isAppReady, token, isGuest, features.length, dispatch]);

  // --- ЭФФЕКТ 3: РОУТИНГ (переброс на нужный экран) ---
  useEffect(() => {
    if (!isAppReady) return;
    const inAuthGroup = (segments[0] as string) === "(auth)";

    if (!token && !isGuest && !inAuthGroup) {
      // Нет ни токена, ни гостя -> на логин
      router.replace("/login");
    } else if ((token || isGuest) && inAuthGroup) {
      // Есть токен или гость, но мы на экране логина -> в каталог
      router.replace("/(drawer)/(tabs)");
    }
  }, [token, isGuest, isAppReady, segments]);

  if (!isAppReady) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="car/[id]" />
      <Stack.Screen name="checkout/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  const colors = useAppColors();
  const theme = useColorScheme(); // 'light' или 'dark'

  useEffect(() => {
    storage.getTheme().then((savedTheme) => {
      if (savedTheme && savedTheme !== "system") {
        Appearance.setColorScheme(savedTheme);
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 1. ГЛАВНАЯ ОБЕРТКА SAFE AREA */}
      <SafeAreaProvider>
        {/* 2. СТАТУС БАР: Задаем ему цвет фона как у приложения, а иконки контрастные */}
        <StatusBar
          style={theme === "dark" ? "light" : "dark"}
          backgroundColor={colors.background}
          translucent={false} // Отключаем наезд контента под статус-бар на Android!
        />

        <BottomSheetModalProvider>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <AppContent />
              <ToastRoot />
              <AlertRoot />
            </QueryClientProvider>
          </Provider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
