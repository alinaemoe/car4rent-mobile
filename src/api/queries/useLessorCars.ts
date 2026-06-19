import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

// Типизацию Car можно взять из твоих существующих интерфейсов, тут привожу базовую
export interface MyCar {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  images?: { url: string; is_main: boolean }[];
}

// 1. Получить МОИ одобренные машины
export const useMyCars = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["cars", "my"],
    queryFn: async (): Promise<MyCar[]> => {
      const response = await axiosInstance.get("/cars/my");
      return response.data;
    },
    enabled: options?.enabled !== false,
  });
};

// 2. Переключить тумблер видимости
export const useToggleCarVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      carId,
      isVisible,
    }: {
      carId: number;
      isVisible: boolean;
    }) => {
      const response = await axiosInstance.patch(`/cars/${carId}/visibility`, {
        isVisible,
      });
      return response.data;
    },
    onSuccess: () => {
      // Инвалидируем и мои машины, и публичный каталог, так как машина пропала/появилась
      queryClient.invalidateQueries({ queryKey: ["cars", "my"] });
      queryClient.invalidateQueries({ queryKey: ["cars", "catalog"] });
    },
  });
};
