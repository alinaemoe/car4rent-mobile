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
} from "../src/store/slices/authSlice";
import { storage } from "../src/utils/storage";
import { initI18n } from "@/src/utils/i18n";
import { fetchAndCacheTranslations } from "@/src/api/translations";
import { axiosInstance } from "../src/api/axios-instance";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { User } from "../src/types"; // 👈 Импортируем наш тип User

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
  const { isAppReady, token } = useAppSelector((state) => state.auth);
  const colors = useAppColors();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const initApp = async () => {
      try {
        await initI18n();
        fetchAndCacheTranslations(); // Фоновя загрузка

        // ПРОБУЕМ ДОСТАТЬ ТОКЕН
        const accessToken = await storage.getAccessToken();

        if (accessToken) {
          // ДЕЛАЕМ РЕАЛЬНЫЙ ЗАПРОС (если токен протух, axiosInstance сам сделает рефреш!)
          const { data: user } = await axiosInstance.get("/users/profile");
          dispatch(setCredentials({ user, token: accessToken }));
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

    // TypeScript больше не будет ругаться, если типы сгенерировались верно
    const inAuthGroup = segments[0] === "(auth)";

    console.log(
      `🔀 [ROUTER] App is ready. Token: ${!!token}, inAuthGroup: ${inAuthGroup}`,
    );

    if (!token && !inAuthGroup) {
      console.log("➡️ [ROUTER] Кидаем на логин");
      // Передаем как объект (TS это любит) или просто строку, убрав as any
      router.replace("/login");
    } else if (token && inAuthGroup) {
      console.log("➡️ [ROUTER] Кидаем в приложение (drawer)");
      router.replace("/(drawer)/(tabs)");
    }
  }, [token, isAppReady, segments]);

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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
