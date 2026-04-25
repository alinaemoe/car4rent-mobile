import { useState, useEffect } from "react";
import { RentalStatus } from "@/src/api/queries/useRentals";

export const useRentalTimer = (status: RentalStatus, endDate: string) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (status !== "ACTIVE") return;

    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) return "Время вышло";

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (d > 0) return `${d}д ${h}ч ${m}м`;
      return `${h}ч ${m}м`;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(interval);
  }, [status, endDate]);

  return timeLeft;
};
