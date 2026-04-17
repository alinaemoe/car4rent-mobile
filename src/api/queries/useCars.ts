import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";
import { useAppSelector } from "../../store";
import { selectFavoriteCarIds } from "../../store/slices/favoritesSlice";

export const useCarsCatalog = () => {
  const filters = useAppSelector((state) => state.filters);
  const favoriteIds = useAppSelector(selectFavoriteCarIds);

  return useInfiniteQuery({
    // 🔥 Хак для надежного кэширования сложных объектов
    queryKey: [
      "cars",
      "catalog",
      JSON.stringify(filters),
      favoriteIds.join(","),
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (filters.onlyFavorites && favoriteIds.length === 0) {
        return { data: [], meta: { page: 1, totalPages: 1 } };
      }

      const params: any = { page: pageParam, limit: 10 };

      Object.entries(filters).forEach(([key, value]) => {
        if (key === "onlyFavorites") return;

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
