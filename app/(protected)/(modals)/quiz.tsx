// app/(protected)/(modals)/quiz.tsx
import { useAuth } from '@/context/AuthContext';
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

// ✅ Tipi aggiornati per matchare il JSON reale
type AnsText = {
  r_id: string;       // ← era fuori, ora è dentro ogni risposta
  titolo: string;
  descrizione: string;
}

type QuizQandA = {
  q_id: number;
  q_text: string;
  ans_text: AnsText[];
}

type InviaRisposta = {
  userID: number | undefined;
  domanda: number;
  risposta: string;
}

type QuizResponse = { risposta: string }

export default function QuizScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [domandaCorrente, setDomandaCorrente] = useState(0);
  const [rispostaSelezionata, setRispostaSelezionata] = useState<string>("");
  const [risposteSalvate, setRisposteSalvate] = useState<string[]>([]);
  const [tutteDomande, setTutteDomande] = useState<QuizQandA[]>([]);

  const quizTerminato = async () => {
    try {
      await api.post<QuizResponse>("/quizCompletato", { token });
      router.replace("/(protected)/(tabs)/contenuti");
    } catch (err) {
      console.error("Errore durante il completamento del quiz:", err);
    }
  };

  const sendQuizData = async (data: InviaRisposta): Promise<QuizResponse> => {
    const response = await api.post<QuizResponse>("/acquire/quizResponses", data);
    return response.data;
  };

  const getQuizData = async (nQ: number): Promise<QuizQandA> => {
    const response = await api.get<QuizQandA>(`/acquire/quizQuestions?q=${nQ}`);
    return response.data;
  };

  useEffect(() => {
    Promise.all(Array.from({ length: 3 }, (_, i) => getQuizData(i + 1)))
      .then(setTutteDomande)
      .catch((err) => console.error("Errore caricamento domande:", err));
  }, []);

  const avanza = () => {
    const nuoveRisposte = [...risposteSalvate];
    nuoveRisposte[domandaCorrente] = rispostaSelezionata;
    setRisposteSalvate(nuoveRisposte);

    const datiQuiz: InviaRisposta = {
      userID: user?.userid,
      domanda: domandaCorrente + 1,
      // ✅ Manda r_id della risposta scelta, non l'indice
      risposta: tutteDomande[domandaCorrente].ans_text[parseInt(rispostaSelezionata)].r_id
    };
    sendQuizData(datiQuiz).catch((err) => console.error(err));

    if (domandaCorrente === tutteDomande.length - 1) {
      quizTerminato();
    } else {
      setDomandaCorrente(domandaCorrente + 1);
      setRispostaSelezionata(risposteSalvate[domandaCorrente + 1] || "");
    }
  };

  const indietro = () => {
    if (domandaCorrente > 0) {
      const paginaPrecedente = domandaCorrente - 1;
      setDomandaCorrente(paginaPrecedente);
      setRispostaSelezionata(risposteSalvate[paginaPrecedente] || "");
    }
  };

  const progresso = tutteDomande.length > 0 ? ((domandaCorrente + 1) / tutteDomande.length) * 100 : 0;
  const esUltimaDomanda = domandaCorrente === tutteDomande.length - 1;
  const disabilitato = rispostaSelezionata === "";

  // Domanda e opzioni correnti
  const domandaAttuale = tutteDomande[domandaCorrente];
  const opzioni = domandaAttuale?.ans_text ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <View className="flex-1 px-6 py-6 justify-between">

        {/* ── HEADER & PROGRESS BAR ── */}
        <View className="gap-3.5">
          <View className="flex-row justify-between items-center">
            <Text className="text-[#556070] text-sm font-bold tracking-wide">Quiz di orientamento</Text>
            <Badge className="bg-[#CCDFFD] border border-[#066CF4]/20 px-3 py-1 rounded-full">
              <Text className="text-[#066CF4] text-xs font-black">
                {domandaCorrente + 1} / {tutteDomande.length || "..."}
              </Text>
            </Badge>
          </View>

          <View className="h-2.5 bg-[#CCDFFD] rounded-full overflow-hidden">
            <View style={{ width: `${progresso}%` }} className="h-full bg-[#066CF4] rounded-full" />
          </View>
        </View>

        {/* ── CORPO DELLA DOMANDA ── */}
        <View className="flex-1 justify-center my-2">
          <Text className="text-[#0B131F] text-3xl font-extrabold tracking-tight mb-1">
            Ciao {user?.full_name}!
          </Text>

          <View className="gap-1.5 mb-5">
            <Text className="text-[#066CF4] text-[11px] font-black tracking-widest uppercase">
              Domanda {domandaCorrente + 1}
            </Text>
            <Text className="text-[#1A2433] text-2xl font-bold leading-tight tracking-tight">
              {/* ✅ Usa q_text dalla domanda corrente */}
              {domandaAttuale?.q_text ?? "Caricamento della domanda..."}
            </Text>
          </View>

          {/* ✅ Opzioni mappate da ans_text con r_id come chiave */}
          <View className="gap-3.5">
            {opzioni.map((opzione, index) => {
              const idxString = index.toString();
              const isSel = rispostaSelezionata === idxString;

              return (
                <Pressable
                  key={opzione.r_id}              // ✅ r_id come key, stabile e univoco
                  onPress={() => setRispostaSelezionata(idxString)}
                  className="active:opacity-95"
                >
                  <Card
                    className={`border-2 rounded-2xl p-0.5 shadow-sm ${
                      isSel
                        ? "border-[#066CF4] bg-[#E6F0FE]"
                        : "border-[#CCDFFD] bg-white"
                    }`}
                  >
                    <CardHeader className="flex-row justify-between items-center p-4">
                      <View className="flex-1 pr-3">
                        <CardTitle className={`text-base font-bold ${
                          isSel ? "text-[#066CF4]" : "text-[#1A2433]"
                        }`}>
                          {opzione.titolo}
                        </CardTitle>
                        <CardDescription className={`text-xs mt-1 leading-normal ${
                          isSel ? "text-[#4A5E7A]" : "text-[#65758C]"
                        }`}>
                          {opzione.descrizione}
                        </CardDescription>
                      </View>

                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          isSel ? "border-[#066CF4] bg-[#066CF4]" : "border-[#A4B8D4] bg-transparent"
                        }`}
                      >
                        {isSel && <View className="w-2 h-2 rounded-full bg-white" />}
                      </View>
                    </CardHeader>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── BOTTONI DI AZIONE ── */}
        <View className="gap-2.5 mt-2">
          <Button
            size="lg"
            className={`rounded-xl w-full h-14 shadow-md ${
              disabilitato ? "bg-[#9BC2FB]" : "bg-[#066CF4]"
            }`}
            onPress={avanza}
            disabled={disabilitato}
          >
            <Text className={`text-base font-bold ${
              disabilitato ? "text-[#556070]" : "text-white"
            }`}>
              {esUltimaDomanda ? "Fine" : "Avanti"}
            </Text>
          </Button>

          {domandaCorrente > 0 && (
            <Button
              variant="ghost"
              className="py-3 items-center justify-center"
              onPress={indietro}
            >
              <Text className="text-[#556070] text-sm font-bold">Indietro</Text>
            </Button>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}