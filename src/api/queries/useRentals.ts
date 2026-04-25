import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

export type RentalStatus =
  | "CREATED"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELED"
  | "REJECTED"
  | "OVERDUE";

export interface Rental {
  id: number;
  status: RentalStatus;
  start_date: string;
  end_date: string;
  actual_return_date: string | null;
  base_price: string;
  penalty_price: string;
  total_price: string | null;
  has_review: boolean; // 👈 Наш новый флаг с бэка!
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    images: { url: string; is_main: boolean }[];
  };
}

export const useMyRentals = () => {
  return useQuery<Rental[]>({
    queryKey: ["my-rentals"],
    queryFn: async () => {
      const response = await axiosInstance.get("/rentals/my");
      return response.data;
    },
  });
};
