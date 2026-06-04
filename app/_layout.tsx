//app/_layout
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@/global.css";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return; 

    if (user?.quizsolved) {
      router.replace("/(protected)/(tabs)/contenuti");
    } else {
      router.replace("/(protected)/(modals)/quiz");
    }
  }, [isAuthenticated, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(protected)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}