// app/index.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/AuthContext";
import "@/global.css";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

type LoginBody = { username: string; password: string; };
type LoginResponse = { access_token: string; refresh_token: string; token_type: string; };

const loginUser = async (data: LoginBody): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/login", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  return response.data;
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleContinua = async () => {
    if (!username || !password) {
      Alert.alert("Errore", "Riempi tutti i campi");
      return;
    }

    try {
      const responseLogin = await loginUser({ username, password });
      await login(responseLogin.access_token, responseLogin.refresh_token);
      if (user?.quizsolved) {
        router.replace("/contenuti");
      } else {
        router.replace("/quiz");
      }
    } catch (error: any) {
      Alert.alert("Errore", "Login fallito, controlla le credenziali");
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-[#F8FAFC]">
      <View className="w-full p-6 bg-white border border-[#0F1729]/[0.08] rounded-[20px] shadow-lg shadow-[#0F1729]/[0.06] gap-6">
        
        <View className="gap-1 items-center mb-2">
          <Text className="text-2xl font-extrabold text-[#0B1220] tracking-tight">Bentornato</Text>
          <Text className="text-sm text-[#475569] font-medium">Accedi per continuare il tuo percorso</Text>
        </View>

        <View className="w-full gap-4">
          <View className="gap-2">
            <Label nativeID="email" className="text-[#0B1220] font-semibold text-[13px]">Email</Label>
            <Input
              nativeID="email"
              placeholder="nome@esempio.com"
              value={username}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="h-12 rounded-full border-[#0F1729]/[0.14] px-4"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="password" className="text-[#0B1220] font-semibold text-[13px]">Password</Label>
            <Input
              nativeID="password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="h-12 rounded-full border-[#0F1729]/[0.14] px-4"
            />
          </View>
        </View>

        <Button onPress={handleContinua} className="w-full h-12 bg-[#066CF4] rounded-full active:opacity-90">
          <Text className="text-white font-bold text-base">Continua</Text>
        </Button>
      </View>
    </View>
  );
}