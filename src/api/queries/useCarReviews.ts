import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";
import { CarReviewPreview } from "../../types";

interface PaginatedReviews {
  data: CarReviewPreview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useCarReviews = (
  carId: number,
  initialReviews?: CarReviewPreview[],
  totalReviewsCount?: number,
) => {
  return useInfiniteQuery<PaginatedReviews>({
    queryKey: ["reviews", "car", carId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axiosInstance.get(
        `/reviews/car/${carId}?page=${pageParam}&limit=3`,
      );
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    // 🔥 МАГИЯ: Скармливаем первые 3 отзыва из getCatalogOne как "Страницу 1"
    initialData: () => {
      if (
        initialReviews &&
        initialReviews.length > 0 &&
        totalReviewsCount !== undefined
      ) {
        return {
          pages: [
            {
              data: initialReviews,
              meta: {
                page: 1,
                limit: 3,
                total: totalReviewsCount,
                totalPages: Math.ceil(totalReviewsCount / 3),
              },
            },
          ],
          pageParams: [1],
        };
      }
      return undefined;
    },
    enabled: !!carId,
  });
};
