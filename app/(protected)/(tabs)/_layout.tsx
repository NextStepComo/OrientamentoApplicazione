// app/(protected)/(tabs)/_layout.tsx
import "@/global.css";
import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="contenuti" />
    </Stack>
  );
}