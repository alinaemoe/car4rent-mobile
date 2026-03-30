import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../src/api/axios-instance";

// Временный тип для проверки
interface Car {
  id: number;
  brand: string;
  model: string;
  price_per_day: number;
}

export default function HomeScreen() {
  // Делаем запрос через React Query
  const {
    data: cars,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cars"], // Ключ для кэширования
    queryFn: async () => {
      // Идем на твой NestJS за списком машин
      const response = await axiosInstance.get("/cars");
      return response.data; // Предполагаем, что бэкенд возвращает массив машин
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Грузим тачки...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>Ошибка загрузки с бэкенда :(</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Каталог Авто</Text>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.carName}>
              {item.brand} {item.model}
            </Text>
            <Text style={styles.price}>${item.price_per_day} / день</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Машин пока нет</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, marginTop: 40 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  carName: { fontSize: 18, fontWeight: "600" },
  price: { fontSize: 16, color: "green", marginTop: 8 },
});
