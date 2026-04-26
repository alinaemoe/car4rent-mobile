import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

// Типизация заявки
export interface PartnershipRequest {
  id: number;
  car_brand: string;
  car_model: string;
  car_year: number;
  photos: string[] | null;
  status: "NEW" | "APPROVED" | "REJECTED";
  created_at: string;
}

// 1. Получить МОИ заявки
export const useMyRequests = () => {
  return useQuery({
    queryKey: ["partnership-requests", "my"],
    queryFn: async (): Promise<PartnershipRequest[]> => {
      const response = await axiosInstance.get("/partnership-requests/my");
      return response.data;
    },
  });
};

// 2. Удалить МОЮ отклоненную заявку
export const useDeleteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(
        `/partnership-requests/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      // Обновляем список заявок после удаления
      queryClient.invalidateQueries({
        queryKey: ["partnership-requests", "my"],
      });
    },
  });
};
