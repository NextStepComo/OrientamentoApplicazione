// app/(protected)/(modals)/quiz.tsx
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { C, S_GLOBAL } from "@/constants/theme";
import { useAuth } from '@/context/AuthContext';
import "@/global.css";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type InviaRisposta = { userID: number | undefined, domanda: number, risposta: number }
type QuizResponse = { risposta: string }
type AnsText = { cardTitolo1: string, cardDescrizione1: string, cardTitolo2: string, cardDescrizione2: string, cardTitolo3: string, cardDescrizione3: string }
type QuizQandA = { q_id: number, q_text: string, ans_text: AnsText }

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
      risposta: parseInt(rispostaSelezionata, 10)
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

  return (
    <SafeAreaView style={quizStyles.container}>
      <View style={quizStyles.innerLayout}>

        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: C.textSoft, fontSize: 14, fontWeight: "600" }}>Quiz di orientamento</Text>
            <View style={quizStyles.counterBadge}>
              <Text style={{ color: C.nsBlue, fontSize: 13, fontWeight: "700" }}>
                {domandaCorrente + 1} / {tutteDomande.length}
              </Text>
            </View>
          </View>

          <View style={quizStyles.trackBar}>
            <View style={[quizStyles.progressBar, { width: `${progresso}%` }]} />
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: "center", marginVertical: 10 }}>
          <Text style={quizStyles.welcomeText}>Ciao {user?.full_name}!</Text>
          <View style={{ gap: 6, marginBottom: 20 }}>
            <Text style={quizStyles.eyebrow}>Domanda {domandaCorrente + 1}</Text>
            <Text style={quizStyles.title}>{tutteDomande[domandaCorrente]?.q_text ?? "Caricamento..."}</Text>
          </View>

          <View style={{ gap: 12 }}>
            {["1", "2", "3"].map((idx) => {
              const isSel = rispostaSelezionata === idx;
              const t = tutteDomande[domandaCorrente]?.ans_text;
              const title = idx === "1" ? t?.cardTitolo1 : idx === "2" ? t?.cardTitolo2 : t?.cardTitolo3;
              const desc = idx === "1" ? t?.cardDescrizione1 : idx === "2" ? t?.cardDescrizione2 : t?.cardDescrizione3;

              return (
                <Pressable key={idx} onPress={() => setRispostaSelezionata(idx)}>
                  <Card style={[quizStyles.optionCard, { borderColor: isSel ? C.nsBlue : C.line, backgroundColor: isSel ? C.nsBlue50 : C.surface }]}>
                    <CardHeader style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <CardTitle style={{ color: C.nsInk, fontSize: 16, fontWeight: "700" }}>{title}</CardTitle>
                        <CardDescription style={{ color: C.textSoft, fontSize: 13, marginTop: 4, lineHeight: 18 }}>{desc}</CardDescription>
                      </View>
                      <View style={[quizStyles.radioOuter, { borderColor: isSel ? C.nsBlue : C.lineStrong, backgroundColor: isSel ? C.nsBlue : "transparent" }]}>
                        {isSel && <View style={quizStyles.radioInner} />}
                      </View>
                    </CardHeader>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 10, marginTop: 14 }}>
          <Button
            style={[
              quizStyles.actionButton, 
              { backgroundColor: (rispostaSelezionata === "") ? C.nsBluePale : C.nsBlue }
            ]}
            onPress={avanza}
            disabled={rispostaSelezionata === ""}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }} 
          >
            <Text style={{ color: (rispostaSelezionata === "") ? C.textMute : "#ffffff", fontSize: 16, fontWeight: "700" }}>
              {esUltimaDomanda ? "Fine" : "Avanti →"}
            </Text>
          </Button>

          {domandaCorrente > 0 && (
            <Pressable onPress={indietro} style={quizStyles.backBtn}>
              <Text style={{ color: C.textSoft, fontSize: 15, fontWeight: "600" }}>← Indietro</Text>
            </Pressable>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const quizStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  innerLayout: { flex: 1, paddingHorizontal: S_GLOBAL.paddingCanvas, paddingVertical: 24, justifyContent: "space-between" },
  eyebrow: { color: C.textMute, fontSize: 12, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  title: { color: C.nsInk, fontSize: 26, fontWeight: "800", lineHeight: 34, letterSpacing: -0.5 },
  counterBadge: { backgroundColor: C.nsBluePale, paddingHorizontal: 12, paddingVertical: 4, borderRadius: S_GLOBAL.radiusButton },
  trackBar: { height: 6, backgroundColor: C.surfaceAlt, borderRadius: S_GLOBAL.radiusButton, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: C.nsBlue, borderRadius: S_GLOBAL.radiusButton },
  welcomeText: { color: C.nsInk, fontSize: 28, fontWeight: "800", marginBottom: 8, letterSpacing: -0.5 },
  optionCard: { borderWidth: 2, borderRadius: S_GLOBAL.radiusCard, ...S_GLOBAL.shadow },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.surface },
  actionButton: { borderRadius: S_GLOBAL.radiusButton, paddingVertical: 16, alignItems: "center", justifyContent: "center", width: "100%", height: 54 },
  backBtn: { paddingVertical: 12, alignItems: "center", justifyContent: "center" }
});