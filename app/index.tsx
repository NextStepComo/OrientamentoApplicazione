// app/index.tsx
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/AuthContext";
import "@/global.css";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

type LoginBody = {
  username: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

const loginUser = async (data: LoginBody): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    "http://10.0.1.51:8000/login",
    data,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data;
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [quizFatto, setQuizFatto] = useState(false);
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleContinua = async () => {
    if (!username || !password) {
      Alert.alert("Errore", "Riempi tutti i campi");
      return;
    }

    try {
      const responseLogin = await loginUser({ username, password });
      await login(responseLogin.access_token);
      if (quizFatto) {
        router.replace("/contenuti");
      } else {
        router.replace("/quiz");
      }
    } catch (error: any) {
      Alert.alert("Errore", "Login fallito, controlla le credenziali");
      
      if (error.response) {
        console.log("Dati Errore:", error.response.data);
        console.log("Status Errore:", error.response.status);
      } else {
        console.log("Errore di rete o configurazione:", error.message);
      }
    }
  };

  return (
    <View className="flex-1 justify-center items-center gap-6 p-6">
      <Text className="text-2xl font-bold">Login:</Text>

      <View className="w-full gap-4">
        <View className="gap-2">
          <Label nativeID="email">Email</Label>
          <Input
            nativeID="email"
            placeholder="nome@esempio.com"
            value={username}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="password">Password</Label>
          <Input
            nativeID="password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Checkbox
          id="checkQuiz"
          checked={quizFatto}
          onCheckedChange={(val) => setQuizFatto(val === true)}
        />
        <Label
          nativeID="checkQuiz"
          onPress={() => setQuizFatto(!quizFatto)}
        >
          Ho già fatto il quiz
        </Label>
      </View>

      <Button onPress={handleContinua} className="w-full">
        <Text>Continua</Text>
      </Button>
    </View>
  );
}