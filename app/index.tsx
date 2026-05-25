import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Text, View } from "react-native";


export default function HomeScreen() {
  const [value, setValue] = useState("");
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);

  function getValore(){
    let val = "";
    if(check1 == true){
      val += "Prima opzione selezionata ";
    }
    if(check2 == true){
      val += "Seconda opzione selezionata ";
    }
    return val;
  }
  
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-8">
      <Input
        placeholder="Scrivi qualcosa..."
        value={value}
        onChangeText={setValue}
        className="w-full size-30"
      />

      <View className="flex-row items-center gap-2">
        <Checkbox
          checked={check1}
          onCheckedChange={(val) => setCheck1(val)}
        />
        <Label>Opzione 1</Label>
      </View>

      <View className="flex-row items-center gap-2">
        <Checkbox
          checked={check2}
          onCheckedChange={(val) => setCheck2(val)}
        />
        <Label>Opzione dhbjk2</Label>
      </View>

      <Button
        className="bg-blue-500 px-10"
        onPress={() => alert(`Hai scritto: ${value}, ${getValore()}`)}
      >
        <Text className="text-white">Invia</Text>
      </Button>
    </View>
  );
}