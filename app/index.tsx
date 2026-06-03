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
        router.replace("/(protected)/(tabs)/contenuti");
      } else {
        router.replace("/(protected)/(modals)/quiz");
      }
    } catch (error: any) {
      Alert.alert("Errore", "Login fallito, controlla le credenziali");
    }
  };

  return (
    // Sfondo dell'applicazione impostato sul grigio/blu neutro chiaro della palette
    <View className="flex-1 justify-center items-center p-6 bg-[#F5F7FA]">
      
      {/* CARD DI LOGIN - Bordo coordinato con la Tinta 20% (#CCDFFD) */}
      <View className="w-full p-6 bg-white border border-[#CCDFFD] rounded-[24px] shadow-sm gap-6">
        
        {/* HEADER */}
        <View className="gap-1 items-center mb-1">
          <Text className="text-2xl font-black text-[#0B131F] tracking-tight">Bentornato</Text>
          <Text className="text-sm text-[#556070] font-medium text-center">
            Accedi per continuare il tuo percorso
          </Text>
        </View>

        {/* INPUT FORM */}
        <View className="w-full gap-4">
          <View className="gap-2">
            <Label nativeID="email" className="text-[#1A2433] font-bold text-[13px]">Email</Label>
            <Input
              nativeID="email"
              placeholder="nome@esempio.com"
              value={username}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#8893A7"
              className="h-12 rounded-full border-[#CCDFFD] px-4 bg-white text-[#0B131F]"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="password" className="text-[#1A2433] font-bold text-[13px]">Password</Label>
            <Input
              nativeID="password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#8893A7"
              className="h-12 rounded-full border-[#CCDFFD] px-4 bg-white text-[#0B131F]"
            />
          </View>
        </View>

        {/* SUBMIT BUTTON - Blu principale al 100% (#066CF4) */}
        <Button 
          size="lg" 
          onPress={handleContinua} 
          className="w-full h-12 bg-[#066CF4] rounded-full shadow-sm active:opacity-90 flex-row items-center justify-center"
        >
          <Text className="text-white font-black text-base">Continua</Text>
        </Button>

      </View>
    </View>
  );
}