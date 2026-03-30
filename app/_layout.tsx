import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Импорты из нашей новой папки src/
import { store, useAppDispatch, useAppSelector } from "../src/store";
import {
  setCredentials,
  logout,
  setAppReady,
} from "../src/store/slices/authSlice";
import { storage } from "../src/utils/storage";
import { axiosInstance } from "../src/api/axios-instance";

// 1. Удерживаем Splash Screen (заставку), пока мы проверяем токен
SplashScreen.preventAutoHideAsync();

// 2. Настраиваем React Query (кэширование запросов)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Если запрос упал, попробуем еще 1 раз
      refetchOnWindowFocus: false,
    },
  },
});

// --- ВНУТРЕННИЙ КОМПОНЕНТ (Здесь работает Redux) ---
function AppContent() {
  const dispatch = useAppDispatch();
  const { isAppReady } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Шаг 1: Ищем токен в сейфе телефона
        const token = await storage.getToken();

        if (token) {
          // Шаг 2: Если токен есть, стучимся на бэк за актуальными данными юзера.
          // ⚠️ ЗАМЕНИ '/auth/profile' на тот эндпоинт, который у тебя в NestJS возвращает профиль!
          // Например: '/users/me' или '/auth/me'
          const { data } = await axiosInstance.get("/users/profile");

          // Шаг 3: Сохраняем свежие данные в Redux
          dispatch(setCredentials({ user: data, token }));
        } else {
          // Токена нет — сбрасываем стейт (Гость)
          dispatch(logout());
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        // Если бэк ответил ошибкой (например, токен протух), выкидываем юзера
        dispatch(logout());
        await storage.removeToken();
      } finally {
        // Шаг 4: Говорим приложению "Я всё загрузил!"
        dispatch(setAppReady());
        // Убираем заставку
        SplashScreen.hideAsync();
      }
    };

    initAuth();
  }, [dispatch]);

  // Пока приложение не готово (идет запрос), ничего не рендерим.
  // Юзер в это время всё еще видит Splash Screen (заставку).
  if (!isAppReady) {
    return null;
  }

  // Приложение готово! Показываем навигацию.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Главный роутер укажет на табы */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Сюда потом добавим экраны логина, машины и т.д. */}
      {/* <Stack.Screen name="login" options={{ presentation: 'modal' }} /> */}
    </Stack>
  );
}

// --- ВНЕШНИЙ КОМПОНЕНТ (Точка входа) ---
export default function RootLayout() {
  return (
    // Оборачиваем всё в Redux и React Query
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
