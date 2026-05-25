// app/login.tsx
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import "@/global.css";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function LoginScreen() {
  const [quizFatto, setQuizFatto] = useState(false);
  const router = useRouter();

  const handleContinua = () => {
    if (quizFatto) {
      router.replace("/(protected)/(tabs)/contenuti" as any);
    } else {
      router.replace("/(protected)/(modals)/quiz" as any);
    }
  };

  return (
    <View className="flex-1 justify-center items-center gap-6 p-6">
      <Text className="text-2xl font-bold">Benvenuto</Text>

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

      <Button onPress={handleContinua}>
        <Text>Continua</Text>
      </Button>
    </View>
  );
}