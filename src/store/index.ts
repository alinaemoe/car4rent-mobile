// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // В будущем тут появятся:
    // booking: bookingReducer (информация о текущем процессе аренды)
  },
  // Отключаем проверку на несериализуемые данные, если они вдруг проскочат (стандартный фикс для RTK)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Кастомные хуки, которые мы будем использовать в компонентах вместо стандартных
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
