import { CarCard } from "@/src/components/CarCard";
import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { Car } from "@/src/types";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

interface Props {
  cars: Car[];
}

export const CatalogMap = ({ cars }: Props) => {
  const colors = useAppColors();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // 1. Фильтруем машины с координатами
  const mapCars = useMemo(
    () =>
      cars.filter((car) => car.location?.latitude && car.location?.longitude),
    [cars],
  );

  // 2. Вычисляем начальный регион (исправляем ошибку "Cannot find name")
  const initialRegion = useMemo(() => {
    if (mapCars.length > 0) {
      return {
        latitude: Number(mapCars[0].location!.latitude),
        longitude: Number(mapCars[0].location!.longitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // Дефолтный Минск, если машин нет
    return {
      latitude: 53.9022,
      longitude: 27.5619,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [mapCars]);

  // 3. Функция разброса (Spiderifier), чтобы метки не слипались
  const getCoordinates = (car: Car, index: number) => {
    const lat = Number(car.location!.latitude);
    const lng = Number(car.location!.longitude);

    const sameLocationCars = mapCars.filter(
      (c) =>
        c.location?.latitude === car.location?.latitude &&
        c.location?.longitude === car.location?.longitude,
    );

    if (sameLocationCars.length <= 1) return { latitude: lat, longitude: lng };

    const angle = (index / sameLocationCars.length) * Math.PI * 2;
    const radius = 0.0005; // Радиус "цветка"

    return {
      latitude: lat + Math.sin(angle) * radius,
      longitude: lng + Math.cos(angle) * radius,
    };
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={() => setSelectedCar(null)}
        provider={PROVIDER_GOOGLE} // Убедитесь, что Google Maps настроен, либо удалите для Apple Maps
      >
        {mapCars.map((car, index) => {
          const isSelected = selectedCar?.id === car.id;
          const coords = getCoordinates(car, index);

          return (
            <Marker
              key={car.id}
              coordinate={coords}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedCar(car);
              }}
              zIndex={isSelected ? 99 : index}
            >
              <View
                style={[
                  styles.pricePill,
                  {
                    backgroundColor: isSelected
                      ? colors.accent
                      : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                    transform: [{ scale: isSelected ? 1.1 : 1 }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priceText,
                    { color: isSelected ? "#fff" : colors.textPrimary },
                  ]}
                >
                  {Math.round(car.price_per_day)}{" "}
                  {t("common.currency_br", "Br")}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Карточка выбранного авто */}
      {selectedCar && (
        <View style={styles.selectedCarOverlay}>
          <CarCard
            car={selectedCar}
            onPress={() =>
              router.push({
                pathname: "/car/[id]",
                params: { id: selectedCar.id },
              })
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  pricePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  priceText: { fontWeight: "800", fontSize: 13 },
  selectedCarOverlay: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
  },
});
