import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

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

      // 3. Правильно упаковываем фотографии
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((uri, index) => {
          // Вытаскиваем имя файла и расширение из URI
          const filename = uri.split("/").pop() || `photo_${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          // В React Native append для файлов принимает объект { uri, name, type }
          formData.append("photos", {
            uri,
            name: filename,
            type,
          } as any); // as any нужен, чтобы TypeScript не ругался на формат RN
        });
      }

      // 4. Отправляем на бэк с правильным заголовком
      const response = await axiosInstance.post(
        "/partnership-requests",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
  });
};
