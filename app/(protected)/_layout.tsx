// app/(protected)/_layout.tsx
//QUANDO SEI LOGGATO
import { useAuth } from "@/context/AuthContext";
import "@/global.css";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href={{ pathname: "/login" as any }} />;  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(modals)" />
    </Stack>
  );
}