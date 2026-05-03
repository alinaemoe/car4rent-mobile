import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

export interface FaqItem {
  id: number;
  question: { ru: string; en: string };
  answer: { ru: string; en: string };
  order_index: number;
}

export const useFaqs = () => {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async (): Promise<FaqItem[]> => {
      const { data } = await axiosInstance.get("/faq");
      return data;
    },
    // 🔥 МАГИЯ КЭША: Данные будут считаться свежими 24 часа.
    // Запросы на бэк дублироваться не будут!
    staleTime: 1000 * 60 * 60 * 24,
  });
};
