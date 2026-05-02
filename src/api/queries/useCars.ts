import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";
import { useAppSelector } from "../../store";
import { selectFavoriteCarIds } from "../../store/slices/favoritesSlice";

export const useCarsCatalog = () => {
  const filters = useAppSelector((state) => state.filters);
  const favoriteIds = useAppSelector(selectFavoriteCarIds);

  return useInfiniteQuery({
    queryKey: [
      "cars",
      "catalog",
      JSON.stringify(filters),
      favoriteIds.join(","),
    ],
    queryFn: async ({ pageParam = 1 }) => {
      // Если включены только избранные, но их нет — не мучаем бэк
      if (filters.onlyFavorites && favoriteIds.length === 0) {
        return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
      }

      const params: any = { page: pageParam, limit: 10 };

      Object.entries(filters).forEach(([key, value]) => {
        if (key === "onlyFavorites") return;

        // 👇 МАППИНГ ДАТ ДЛЯ БЭКЕНДА (camelCase -> snake_case)
        if (key === "startDate") {
          params.start_date = value;
          return;
        }
        if (key === "endDate") {
          params.end_date = value;
          return;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) params[key] = value.join(",");
        } else if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });

      if (filters.onlyFavorites) {
        params.ids = favoriteIds.join(",");
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

export const useCarDetail = (id: number) => {
  return useQuery({
    queryKey: ["car", "detail", id],
    queryFn: async () => {
      // Дергаем тот самый новый публичный эндпоинт, который мы написали на бэке
      const { data } = await axiosInstance.get(`/cars/catalog/${id}`);
      return data;
    },
    // Не делаем запрос, если id вдруг NaN (защита от дурака)
    enabled: !!id && !isNaN(id),
    staleTime: 1000 * 60 * 5, // Кэшируем на 5 минут, чтобы при возврате назад не было лоадера
  });
};
