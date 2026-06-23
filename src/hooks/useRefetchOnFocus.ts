import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Перезапрашивает данные react-query при каждом фокусе экрана.
 * Используем на экранах, где важна свежесть при возврате: новости, история
 * поездок, FAQ. Каталог обновляется через pull-to-refresh, профиль — своим
 * useFocusEffect в ProfileScreen.
 */
export function useRefetchOnFocus(refetch: () => unknown) {
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
}
