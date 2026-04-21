import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useAppColors } from "@/src/hooks/use-color-scheme.web";
import { useAppSelector } from "@/src/store";
import { useCarDetail } from "@/src/api/queries/useCars";
import { usePriceCalculator } from "@/src/hooks/usePriceCalculator";

// Импортируем наши новые микро-компоненты
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutMiniCar } from "./components/CheckoutMiniCar";
import { CheckoutForm } from "./components/CheckoutForm";
import { CheckoutSummary } from "./components/CheckoutSummary";
import { CheckoutFooter } from "./components/CheckoutFooter";

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();

  const { startDate, endDate } = useAppSelector((state) => state.filters);
  const { data: car, isLoading } = useCarDetail(Number(id));

  const [destination, setDestination] = useState("");

  const {
    days,
    baseTotal,
    discountAmount,
    finalRentPrice,
    deposit,
    grandTotal,
  } = usePriceCalculator(car, startDate, endDate);

  const handleCreateRequest = () => {
    console.log("🚀 Создаем бронь. Адрес:", destination, "Итого:", grandTotal);
    // router.push('/checkout/success');
  };

  if (isLoading || !car)
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;

  const isFormValid = startDate && endDate;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Наш обновленный Sticky Header */}
      <CheckoutHeader onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Карточка авто, которая визуально "прилипает" к хедеру */}
        <CheckoutMiniCar car={car} />

        <View style={{ paddingHorizontal: 8, paddingTop: 16 }}>
          <CheckoutForm
            startDate={startDate}
            endDate={endDate}
            destination={destination}
            setDestination={setDestination}
          />

          <CheckoutSummary
            days={days}
            baseTotal={baseTotal}
            discountAmount={discountAmount}
            finalRentPrice={finalRentPrice}
            deposit={deposit}
            discountTiers={car.discount_tiers}
          />
        </View>
      </ScrollView>

      <CheckoutFooter
        isFormValid={!!isFormValid}
        onSubmit={handleCreateRequest}
      />
    </View>
  );
}
