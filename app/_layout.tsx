// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import "@/global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(protected)" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}