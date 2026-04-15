import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";
import { useAppSelector } from "../../store";

export const useCarsCatalog = () => {
  // Достаем активные фильтры из стора
  const filters = useAppSelector((state) => state.filters);

  return useInfiniteQuery({
    // queryKey - это "ключ кэша". Если filters изменятся, React Query сделает новый запрос
    queryKey: ["cars", "catalog", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axiosInstance.get("/cars/catalog", {
        params: {
          ...filters,
          page: pageParam,
          limit: 10, // Подгружаем по 10 машин за раз
        },
      });
      return data; // Возвращаем объект { data: [...], meta: { ... } }
    },
    // Указываем стартовую страницу
    initialPageParam: 1,
    // Логика определения следующей страницы
    getNextPageParam: (lastPage) => {
      // Если текущая страница меньше общего количества страниц, то идем дальше
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined; // Больше грузить нечего
    },
  });
};
