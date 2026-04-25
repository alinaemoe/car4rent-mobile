import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

interface CreateReviewData {
  rental_id: number;
  rating: number;
  comment: string;
}

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await axiosInstance.post("/reviews", data);
      return response.data;
    },
    onSuccess: () => {
      // Инвалидируем кэш поездок, чтобы кнопка "Оценить" пропала
      queryClient.invalidateQueries({ queryKey: ["my-rentals"] });
      // Также можно инвалидировать кэш авто, так как рейтинг обновился
      // queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
};
