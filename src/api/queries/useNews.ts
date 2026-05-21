import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

export interface NewsItem {
  id: number;
  title: { ru: string; en: string };
  text: { ru: string; en: string };
  badge: { ru: string; en: string };
  image_url: string;
  created_at: string;
}

export const useNews = () => {
  return useQuery({
    queryKey: ["news"],
    queryFn: async (): Promise<NewsItem[]> => {
      const { data } = await axiosInstance.get("/news");
      return data;
    },
    staleTime: 1000 * 60 * 10, // Кешируем новости на 10 минут
  });
};
