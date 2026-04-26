import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

// Здесь можно импортировать RentalStatus из твоих файлов
export interface CarRentalHistoryItem {
  id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status:
    | "CREATED"
    | "APPROVED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELED"
    | "REJECTED";
  user?: { first_name: string; last_name: string; phone: string }; // Кто брал
}

export const useCarRentalsHistory = (carId: number) => {
  return useQuery({
    queryKey: ["rentals", "car", carId],
    queryFn: async (): Promise<CarRentalHistoryItem[]> => {
      const response = await axiosInstance.get(`/rentals/car/${carId}`);
      return response.data;
    },
    // Не делаем запрос, если carId не передан
    enabled: !!carId,
  });
};
