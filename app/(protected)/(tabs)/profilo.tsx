// app/(protected)/(tabs)/profilo.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import dei componenti da React Native Reusables
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/AuthContext";

// Altezza della BottomNavBar per evitare elementi nascosti
const NAVBAR_HEIGHT = 80;

export default function ProfiloScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, rifaiQuestionario } = useAuth();

  // Dati fittizi segnaposto
  const utente = {
    nome: ""+user?.full_name,
    email: user?.username,
    scuola: "Liceo Scientifico Paolo Frisi",
    citta: "Monza (MB)",
    questionarioCompletato: user?.quizsolved,
    dataCompilazione: "28/05/2026",
  };

  const handleLogout = () => {
    logout();
  };
  const handleRedoQuestionario = () => {
    rifaiQuestionario();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA", paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: NAVBAR_HEIGHT + 24 }}
        className="px-4 pt-6"
      >
        
        {/* ── HEADER PROFILO (Interlinea Ristretta) ── */}
        <Card className="items-center justify-center py-5 mb-6 bg-[#E6F0FE] border-[#CCDFFD] shadow-sm w-full">
          <View className="items-center justify-center w-full mb-0">
            <Avatar alt={utente.nome} className="w-20 h-20 shadow-md border-2 border-white rounded-full overflow-hidden">
              <AvatarImage source={{ uri: "https://avatar.iran.liara.run/public/30" }} />
            </Avatar>
          </View>
          
          {/* Nome utente con altezza linea azzerata */}
          <CardTitle className="text-xl font-black text-center text-[#0B131F] w-full leading-none m-0 p-0">
            {utente.nome}
          </CardTitle>
          
          {/* Email riavvicinata grazie a un margine minimo e leading-none */}
          <CardDescription className="text-sm text-center text-[#066CF4] font-medium w-full leading-none mt-1.5 m-0 p-0">
            {utente.email}
          </CardDescription>
        </Card>

        {/* ── DETTAGLI ACCOUNT (Altezze Bilanciate + Interlinea Originale) ── */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-[#65758C] uppercase tracking-wide mb-2 ml-1">
            Dettagli Account
          </Text>
          <Card className="bg-white border-[#CCDFFD] shadow-sm overflow-hidden p-0">
            <View className="p-0 m-0">
              
              {/* PRIMA RIGA (Zona / Sede) */}
              <View className="flex-row items-center px-4 h-16 w-full">
                <View className="w-10 h-10 rounded-xl bg-[#E6F0FE] items-center justify-center shadow-sm mr-4">
                  <MaterialIcons name="location-on" size={20} color="#066CF4" />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-[10px] font-bold text-[#65758C] uppercase tracking-wide">
                    Zona / Sede
                  </Text>
                  <Text className="text-sm font-black text-[#0B131F] mt-1">
                    {utente.citta}
                  </Text>
                </View>
              </View>

              <Separator style={{ backgroundColor: "#CCDFFD" }} />

              {/* SECONDA RIGA (Istituto) */}
              <View className="flex-row items-center px-4 h-16 w-full">
                <View className="w-10 h-10 rounded-xl bg-[#E6F0FE] items-center justify-center shadow-sm mr-4">
                  <MaterialIcons name="school" size={20} color="#066CF4" />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-[10px] font-bold text-[#65758C] uppercase tracking-wide">
                    Istituto di riferimento
                  </Text>
                  <Text className="text-sm font-black text-[#0B131F] mt-1" numberOfLines={1}>
                    {utente.scuola}
                  </Text>
                </View>
              </View>

            </View>
          </Card>
        </View>

        {/* ── SEZIONE QUESTIONARIO ── */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-[#65758C] uppercase tracking-wide mb-2 ml-1">
            Questionario Orientamento
          </Text>
          <Card className="bg-white border-[#CCDFFD] shadow-sm">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-black text-[#0B131F]">Stato Risposte</CardTitle>
              <Badge 
                style={{ 
                  backgroundColor: utente.questionarioCompletato ? "#ECFDF5" : "#FEF3E6",
                  borderColor: utente.questionarioCompletato ? "#A7F3D0" : "#FDE68A" 
                }} 
                className="border rounded-full"
              >
                <Text 
                  style={{ color: utente.questionarioCompletato ? "#059669" : "#D97706" }} 
                  className="text-xs font-black"
                >
                  {utente.questionarioCompletato ? "Completato" : "Incompleto"}
                </Text>
              </Badge>
            </CardHeader>
            
            <CardContent>
              <Text className="text-sm text-[#334155] leading-relaxed">
                {utente.questionarioCompletato 
                  ? `Hai risposto a tutte le domande relative ai tuoi interessi. Questionario inviato il ${utente.dataCompilazione}.`
                  : "Compila il questionario per ricevere consigli mirati sui percorsi di studio più adatti alle tue passioni."
                }
              </Text>
            </CardContent>

            <CardFooter>
              <Button 
                variant="outline" 
                style={{ backgroundColor: "#E6F0FE", borderColor: "#CCDFFD" }}
                className="w-full rounded-xl h-11"
                onPress={handleRedoQuestionario}
              >
                <Text className="text-[#066CF4] font-black">
                  {utente.questionarioCompletato ? "Rifai il test" : "Inizia ora"}
                </Text>
              </Button>
            </CardFooter>
          </Card>
        </View>

        {/* ── ZONA LOGOUT ── */}
        <Button 
          variant="destructive" 
          style={{ backgroundColor: "#FFFFFF", borderColor: "#FECDD3" }}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl shadow-sm border mt-2 native:active:bg-[#FFF1F2]"
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={18} color="#E11D48" />
          <Text className="font-black text-[#E11D48]">Disconnetti account</Text>
        </Button>

      </ScrollView>
    </View>
  );
}