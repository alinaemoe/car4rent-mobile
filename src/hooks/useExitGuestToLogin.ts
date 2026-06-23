import { useRouter, Href } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAppDispatch } from "@/src/store";
import { logout } from "@/src/store/slices/authSlice";
import { storage } from "@/src/utils/storage";

/**
 * Полный выход из гостевого режима с переходом на экран входа.
 *
 * Просто router.push("/login") гостю не подходит: пока isGuest=true, рутовый
 * роутер (app/_layout, эффект роутинга) считает гостя «внутри» и выкидывает
 * обратно в каталог. Поэтому сначала стираем токены и флаг гостя, чистим
 * react-query кеш и сбрасываем auth-состояние, и только затем уходим на /login.
 */
export function useExitGuestToLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return async () => {
    await storage.removeTokens();
    await storage.setGuestMode(false);
    queryClient.clear();
    dispatch(logout());
    router.replace("/login" as Href);
  };
}
