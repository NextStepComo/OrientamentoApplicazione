// app/index.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/AuthContext";
import "@/global.css";
import { User } from "@/types/user";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

type LoginBody = { username: string; password: string; };
type LoginResponse = { access_token: string; refresh_token: string; token_type: string; };

const loginUser = async (data: LoginBody): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/login", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  return response.data;
};

// Schermata di Login interna
function LoginScreen({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = useAuth();
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  
  const handleContinua = async () => {
    try {
      const responseLogin = await loginUser({ username, password });
      const freshUser = await login(responseLogin.access_token, responseLogin.refresh_token);
      
      if (freshUser.quizsolved) {
        router.replace("/(protected)/(tabs)/contenuti");
      } else {
        router.replace("/(protected)/(modals)/quiz");
      }
    } catch (error) {
      Alert.alert("Errore", "Login fallito, controlla le credenziali");
    }
  };

  return (
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

      {/* SUBMIT BUTTON */}
      <Button 
        size="lg" 
        onPress={handleContinua} 
        className="w-full h-12 bg-[#066CF4] rounded-full shadow-sm active:opacity-90 flex-row items-center justify-center"
      >
        <Text className="text-white font-black text-base">Continua</Text>
      </Button>

      {/* SWITCH TO REGISTER LINK */}
      <View className="flex-row justify-center items-center mt-1">
        <Text className="text-sm text-[#556070] font-medium">Non hai un account? </Text>
        <Pressable onPress={onSwitchToRegister}>
          <Text className="text-sm text-[#066CF4] font-bold">Registrati</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Schermata di Registrazione interna
function RegisterScreen({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { login, register } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState(''); 
  const [password, setPassword] = useState('');

  const handleBirthDateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 4 && cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    
    setBirthDate(formatted.slice(0, 10));
  };

  const handleRegister = async () => {
    if (!email || !fullName || !birthDate || !password) {
      Alert.alert("Errore", "Tutti i campi sono obbligatori");
      return;
    }

    try {
      const payload: User = {
        username: email,
        full_name: fullName,
        quizsolved: false,
        date_birth: birthDate,
        password: password
      };

      const responseRegister = await register(payload);
      const freshUser = await login(responseRegister.access_token, responseRegister.refresh_token);
      
      if (freshUser.quizsolved) {
        router.replace("/(protected)/(tabs)/contenuti");
      } else {
        router.replace("/(protected)/(modals)/quiz");
      }
    } catch (error) {
      Alert.alert("Errore", "Registrazione fallita");
    }
  };

  return (
    <View className="w-full p-6 bg-white border border-[#CCDFFD] rounded-[24px] shadow-sm gap-6">
      {/* HEADER */}
      <View className="gap-1 items-center mb-1">
        <Text className="text-2xl font-black text-[#0B131F] tracking-tight">Crea un account</Text>
        <Text className="text-sm text-[#556070] font-medium text-center">
          Inizia oggi il tuo percorso
        </Text>
      </View>

      {/* INPUT FORM */}
      <View className="w-full gap-4">
        <View className="gap-2">
          <Label nativeID="fullName" className="text-[#1A2433] font-bold text-[13px]">Nome completo</Label>
          <Input
            nativeID="fullName"
            placeholder="Mario Rossi"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            placeholderTextColor="#8893A7"
            className="h-12 rounded-full border-[#CCDFFD] px-4 bg-white text-[#0B131F]"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="email" className="text-[#1A2433] font-bold text-[13px]">Email</Label>
          <Input
            nativeID="email"
            placeholder="nome@esempio.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#8893A7"
            className="h-12 rounded-full border-[#CCDFFD] px-4 bg-white text-[#0B131F]"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="birthDate" className="text-[#1A2433] font-bold text-[13px]">Data di nascita</Label>
          <Input
            nativeID="birthDate"
            placeholder="AAAA-MM-GG"
            value={birthDate}
            onChangeText={handleBirthDateChange}
            keyboardType="numeric"
            maxLength={10}
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

      {/* SUBMIT BUTTON */}
      <Button 
        size="lg" 
        onPress={handleRegister} 
        className="w-full h-12 bg-[#066CF4] rounded-full shadow-sm active:opacity-90 flex-row items-center justify-center mt-2"
      >
        <Text className="text-white font-black text-base">Registrati</Text>
      </Button>

      {/* SWITCH TO LOGIN LINK */}
      <View className="flex-row justify-center items-center mt-1">
        <Text className="text-sm text-[#556070] font-medium">Sei già registrato? </Text>
        <Pressable onPress={onSwitchToLogin}>
          <Text className="text-sm text-[#066CF4] font-bold">Accedi</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Punto di ingresso principale (Export default della pagina)
export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View className="flex-1 justify-center items-center p-6 bg-[#F5F7FA]">
      {isLogin ? (
        <LoginScreen onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </View>
  );
}