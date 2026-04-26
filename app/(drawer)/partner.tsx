import { Stack } from "expo-router";
import PartnerOnboardingScreen from "@/src/screens/Partner/PartnerOnboardingScreen";

export default function PartnerPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal", // 👈 МАГИЯ ЗДЕСЬ: Выезжает как полноэкранный модал поверх всего!
          animation: "slide_from_bottom",
        }}
      />
      <PartnerOnboardingScreen />
    </>
  );
}
