import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
import { User } from "../src/types"; // 👈 Импортируем наш тип User
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

//  if (storedToken) {
//           const mockUser: User = {
//             id: "uuid-1234-5678",
//             email: "test@client.com",
//             first_name: "Иван",
//             last_name: "Иванов",
//             roles: ["CLIENT"],
//             status: "ACTIVE",
//             is_verified: true,
//           };
//           dispatch(setCredentials({ user: mockUser, token: storedToken }));

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAppReady, token, isGuest } = useAppSelector((state) => state.auth);
  const colors = useAppColors();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const initApp = async () => {
      try {
        await initI18n();
        fetchAndCacheTranslations(); // Фоновя загрузка

        await dispatch(loadFavorites());
        await dispatch(fetchDictionaries());

        // ПРОБУЕМ ДОСТАТЬ ТОКЕН
        const accessToken = await storage.getAccessToken();
        const isGuestSaved = await storage.getGuestMode();

        if (accessToken) {
          const { data: user } = await axiosInstance.get("/users/profile");
          dispatch(setCredentials({ user, token: accessToken }));
        } else if (isGuestSaved) {
          // Если токена нет, но он нажимал "войти как гость" в прошлый раз:
          dispatch(setGuestMode());
        } else {
          dispatch(logout());
        }
      } catch (error) {
        // Если что-то пошло не так (например, сервер лежит или оба токена умерли)
        console.error("Ошибка инициализации профиля:", error);
        dispatch(logout());
        await storage.removeTokens();
      } finally {
        dispatch(setAppReady());
        SplashScreen.hideAsync();
      }
    };
    initApp();
  }, [dispatch]);

  useEffect(() => {
    if (!isAppReady) return;

    const inAuthGroup = (segments[0] as string) === "(auth)";

    console.log(
      `🔀 [ROUTER] App is ready. Token: ${!!token}, isGuest: ${isGuest}, inAuthGroup: ${inAuthGroup}`,
    );

    // 1. ЗАЩИТА: Нет токена И не гость И пытается зайти в каталог -> На логин
    if (!token && !isGuest && !inAuthGroup) {
      console.log("➡️ [ROUTER] Кидаем на логин");
      router.replace("/login");
    }
    // 2. ПРОПУСК: Есть токен ИЛИ он гость, И при этом он сидит на экране логина/регистрации -> В каталог
    else if ((token || isGuest) && inAuthGroup) {
      console.log("➡️ [ROUTER] Кидаем в приложение (drawer)");
      router.replace("/(drawer)/(tabs)");
    }
  }, [token, isGuest, isAppReady, segments]); // 👈 Обязательно добавь isGuest в массив зависимостей!

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
      {/* 👇 ДОБАВЛЯЕМ НАШИ НОВЫЕ ЭКРАНЫ */}
      <Stack.Screen name="car/[id]" />
      <Stack.Screen name="checkout/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
