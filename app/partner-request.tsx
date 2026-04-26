import { Stack } from "expo-router";
import PartnerRequestScreen from "@/src/screens/Partner/PartnerRequestScreen";

export default function PartnerRequestPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal", // Тоже выезжает как модалка для фокуса
          animation: "slide_from_bottom",
        }}
      />
      <PartnerRequestScreen />
    </>
  );
}
