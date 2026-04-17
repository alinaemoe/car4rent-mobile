import { useMemo } from "react";
import { Car } from "../types"; // Твой тип машины

export const usePriceCalculator = (
  car: Car | null | undefined,
  startDate: string | null,
  endDate: string | null,
) => {
  return useMemo(() => {
    if (!car)
      return {
        days: 0,
        baseTotal: 0,
        discountPercent: 0,
        discountAmount: 0,
        finalRentPrice: 0,
        deposit: 0,
        grandTotal: 0,
      };

    let days = 0;
    if (startDate && endDate) {
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      const diffTime = Math.abs(endD.getTime() - startD.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      days = diffDays === 0 ? 1 : diffDays; // Минимум 1 сутки
    }

    const baseTotal = car.price_per_day * (days || 1);
    let discountPercent = 0;

    // Ищем максимальную скидку для выбранного кол-ва дней
    if (car.discount_tiers && days > 0) {
      const tiers = Object.keys(car.discount_tiers)
        .map(Number)
        .sort((a, b) => b - a); // [14, 7, 3]
      for (const tierDays of tiers) {
        if (days >= tierDays) {
          discountPercent = car.discount_tiers[tierDays];
          break;
        }
      }
    }

    const discountAmount = Math.floor((baseTotal * discountPercent) / 100);
    const finalRentPrice = baseTotal - discountAmount;
    const deposit = Number(car.deposit_amount) || 0;
    const grandTotal = finalRentPrice + deposit;

    return {
      days,
      baseTotal,
      discountPercent,
      discountAmount,
      finalRentPrice, // Стоимость аренды со скидкой (без депозита)
      deposit,
      grandTotal, // Итого к оплате сейчас
    };
  }, [car, startDate, endDate]);
};
