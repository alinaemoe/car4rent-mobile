import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";
import { useAppSelector } from "../../store";
import { selectFavoriteCarIds } from "../../store/slices/favoritesSlice"; // 👈 Импорт

export const useCarsCatalog = () => {
  const filters = useAppSelector((state) => state.filters);
  const favoriteIds = useAppSelector(selectFavoriteCarIds); // 👈 Достаем ID

  return useInfiniteQuery({
    queryKey: ["cars", "catalog", filters, favoriteIds], // 👈 Добавили favoriteIds в ключ кэша, чтобы при лайке обновлялся список
    queryFn: async ({ pageParam = 1 }) => {
      // Если включен фильтр "Избранное", но массив пустой -> возвращаем пустую страницу,
      // чтобы не дергать бэкенд зря (ведь если id нет, бэк вернет либо ошибку, либо весь каталог)
      if (filters.onlyFavorites && favoriteIds.length === 0) {
        return { data: [], meta: { page: 1, totalPages: 1 } };
      }

      // Подготавливаем параметры
      const params: any = {
        ...filters,
        page: pageParam,
        limit: 10,
      };

      // Если нажата кнопка "Избранное", прокидываем массив ID на бэкенд
      if (filters.onlyFavorites) {
        params.ids = favoriteIds.join(","); // Бэкенд ждет "1,2,5"
        delete params.onlyFavorites; // Убираем флажок, бэкенду он не нужен
      }

      const { data } = await axiosInstance.get("/cars/catalog", { params });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
};
