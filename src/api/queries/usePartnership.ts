import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";
import { compressImage } from "../../utils/compressImage";

export interface CreatePartnershipDto {
  car_brand: string;
  car_model: string;
  car_year: number;
  owner_name: string;
  owner_phone: string;
  photos?: string[]; // Локальные URI с телефона
}

export const useCreatePartnershipRequest = () => {
  return useMutation({
    mutationFn: async (data: CreatePartnershipDto) => {
      // 1. Создаем объект FormData
      const formData = new FormData();

      // 2. Добавляем все текстовые поля
      formData.append("car_brand", data.car_brand);
      formData.append("car_model", data.car_model);
      formData.append("car_year", String(data.car_year));
      formData.append("owner_name", data.owner_name);
      formData.append("owner_phone", data.owner_phone);

      // 3. Сжимаем и упаковываем фотографии (до 5 штук с камеры — тяжёлые)
      if (data.photos && data.photos.length > 0) {
        for (let index = 0; index < data.photos.length; index++) {
          const compressedUri = await compressImage(data.photos[index]);
          // После сжатия отдаём всегда JPEG
          formData.append("photos", {
            uri: compressedUri,
            name: `photo_${index}.jpg`,
            type: "image/jpeg",
          } as any); // as any нужен, чтобы TypeScript не ругался на формат RN
        }
      }

      // 4. Отправляем на бэк с правильным заголовком
      const response = await axiosInstance.post(
        "/partnership-requests",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Фото с камеры весят несколько МБ, а здесь их до 5 штук. По мобильной
          // сети дефолтных 10с не хватает — поднимаем до 60с, иначе аплоад рвётся.
          timeout: 60000,
        },
      );
      return response.data;
    },
  });
};
