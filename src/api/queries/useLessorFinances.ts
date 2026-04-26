import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

export interface LessorStats {
  total_earned_month: number;
  pending_payout: number;
}

export interface TransactionHistoryItem {
  id: number;
  type: string;
  amount: number;
  lessor_income: number;
  payout_status: "PAID" | "PENDING";
  created_at: string;
  car?: { brand: string; model: string; license_plate: string };
  rental?: { start_date: string; end_date: string };
}

// 1. Статистика (Виджет)
export const useLessorStats = (month?: number, year?: number) => {
  return useQuery({
    // Ключ кэша зависит от месяца и года! Меняем месяц -> делается новый запрос
    queryKey: ["transactions", "lessor", "stats", month, year],
    queryFn: async (): Promise<LessorStats> => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());

      const response = await axiosInstance.get(
        `/transactions/lessor/stats?${params.toString()}`,
      );
      return response.data;
    },
  });
};

// 2. История транзакций (Детализация)
export const useLessorHistory = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ["transactions", "lessor", "history", month, year],
    queryFn: async (): Promise<TransactionHistoryItem[]> => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());

      const response = await axiosInstance.get(
        `/transactions/lessor/history?${params.toString()}`,
      );
      return response.data;
    },
  });
};
