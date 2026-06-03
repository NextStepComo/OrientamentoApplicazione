// app/(protected)/(modals)/quiz.tsx
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import "@/global.css";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type InviaRisposta = {
  userID: number | undefined,
  domanda: number,
  risposta: number
}

type QuizResponse = {
  risposta: string
}

type AnsText = {
  cardTitolo1: string, cardDescrizione1: string,
  cardTitolo2: string, cardDescrizione2: string,
  cardTitolo3: string, cardDescrizione3: string,
}

type QuizQandA = {
  q_id: number,
  q_text: string,
  ans_text: AnsText
}

export default function QuizScreen() {
  const { user } = useAuth();
  const [domandaCorrente, setDomandaCorrente] = useState(0);
  const [rispostaSelezionata, setRispostaSelezionata] = useState<string>("");
  const [risposteSalvate, setRisposteSalvate] = useState<string[]>([]);
  const [quizFinito, setQuizFinito] = useState<boolean>(false);
  const [tutteDomande, setTutteDomande] = useState<QuizQandA[]>([]);

  const sendQuizData = async (data: InviaRisposta): Promise<QuizResponse> => {
    const response = await api.post<QuizResponse>("/acquire/quizResponses", data);
    return response.data;
  };

  const getQuizData = async (nQ: number): Promise<QuizQandA> => {
    const response = await api.get<QuizQandA>(`/acquire/quizQuestions?q=${nQ}`);
    return response.data;
  };
  
  useEffect(() => {
    Promise.all(
      Array.from({ length: 3 }, (_, i) => getQuizData(i + 1))
    ).then(setTutteDomande)
     .catch((err) => console.error("Errore caricamento domande:", err));
  }, []);

  const avanza = () => {
    const nuoveRisposte = [...risposteSalvate];
    nuoveRisposte[domandaCorrente] = rispostaSelezionata;
    setRisposteSalvate(nuoveRisposte);

    if (domandaCorrente < tutteDomande.length - 1) {
      setDomandaCorrente(domandaCorrente + 1);
      setRispostaSelezionata(risposteSalvate[domandaCorrente + 1] || "");
    } else {
      setQuizFinito(true);
    }

    const datiQuiz: InviaRisposta = {
      userID: user?.userid,
      domanda: domandaCorrente + 1,
      risposta: parseInt(rispostaSelezionata, 10)
    };

    sendQuizData(datiQuiz)
      .then((res) => {
        console.log("Risposta salvata con successo sul server:", res);
      })
      .catch((err) => {
        console.error("Errore durante l'invio della risposta del quiz:", err.response?.data || err.message);
      });
  };

  const indietro = () => {
    if (domandaCorrente > 0) {
      const paginaPrecedente = domandaCorrente - 1;
      setDomandaCorrente(paginaPrecedente);
      setRispostaSelezionata(risposteSalvate[paginaPrecedente] || "");
    }
  };

  const progresso = ((domandaCorrente + 1) / tutteDomande.length) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, justifyContent: "space-between" }}>

        {/* Schermata Finale delle Risposte */}
        {quizFinito ? (
          <View style={{ flex: 1, justifyContent: "center", gap: 20 }}>
            <View style={{ gap: 6, marginBottom: 10 }}>
              <Text style={{ color: "#6b7280", fontSize: 13, fontWeight: "600", letterSpacing: 1.5, textTransform: "uppercase" }}>
                Completato
              </Text>
              <Text style={{ color: "#111827", fontSize: 26, fontWeight: "800", lineHeight: 34, letterSpacing: -0.5 }}>
                Riepilogo Risposte
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {tutteDomande.map((domanda, index) => {
                const valoreRisposta = risposteSalvate[index];
                let testoRisposta = "";
                if (valoreRisposta === "1") testoRisposta = domanda.ans_text?.cardTitolo1;
                if (valoreRisposta === "2") testoRisposta = domanda.ans_text?.cardTitolo2;
                if (valoreRisposta === "3") testoRisposta = domanda.ans_text?.cardTitolo3;

                return (
                  <Card key={domanda.q_id} style={{ borderColor: "#e5e7eb", borderWidth: 2, borderRadius: 16, backgroundColor: "#ffffff" }}>
                    <CardHeader style={{ padding: 16, gap: 4 }}>
                      <Text style={{ color: "#4b5563", fontSize: 13, fontWeight: "600" }}>{domanda.q_text}</Text>
                      <Text style={{ color: "#2563eb", fontSize: 15, fontWeight: "700" }}>{testoRisposta}</Text>
                    </CardHeader>
                  </Card>
                );
              })}
            </View>
          </View>
        )

        :

        (
          <>
            {/* Header */}
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#4b5563", fontSize: 14, fontWeight: "500" }}>
                  Quiz di orientamento
                </Text>
                <View style={{ backgroundColor: "#e0f2fe", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ color: "#0369a1", fontSize: 13, fontWeight: "700" }}>
                    {domandaCorrente + 1} / {tutteDomande.length}
                  </Text>
                </View>
              </View>

              <View style={{ height: 6, backgroundColor: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
                <View style={{
                  height: "100%",
                  width: `${progresso}%`,
                  backgroundColor: "#2563eb",
                  borderRadius: 999,
                }} />
              </View>
            </View>

            {/* BLOCCO CENTRALE: Domanda + Card vicine tra loro */}
            <View style={{ flex: 1, justifyContent: "center", marginVertical: 10 }}>
              {/* Saluto */}
              <Text style={{ color: "#111827", fontSize: 30, fontWeight: "700", marginBottom: 16 }}>
                Ciao {user?.full_name}!
              </Text>
              {/* Domanda */}
              <View style={{ gap: 6, marginBottom: 20 }}>
                <Text style={{ color: "#6b7280", fontSize: 13, fontWeight: "600", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Domanda {domandaCorrente + 1}
                </Text>
                <Text style={{ color: "#111827", fontSize: 26, fontWeight: "800", lineHeight: 34, letterSpacing: -0.5 }}>
                  {tutteDomande[domandaCorrente]?.q_text ?? "Caricamento..."}
                </Text>
              </View>

              {/* Card risposte */}
              <View style={{ gap: 12 }}>

                {/* Opzione 1 */}
                <Pressable onPress={() => setRispostaSelezionata("1")}>
                  <Card style={{ borderColor: rispostaSelezionata === "1" ? "#2563eb" : "#e5e7eb", borderWidth: 2, borderRadius: 16, backgroundColor: rispostaSelezionata === "1" ? "#eff6ff" : "#ffffff" }}>
                    <CardHeader style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <CardTitle style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>{tutteDomande[domandaCorrente]?.ans_text?.cardTitolo1}</CardTitle>
                        <CardDescription style={{ color: "#4b5563", fontSize: 13, marginTop: 4, lineHeight: 18 }}>{tutteDomande[domandaCorrente]?.ans_text?.cardDescrizione1}</CardDescription>
                      </View>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                        borderColor: rispostaSelezionata === "1" ? "#2563eb" : "#d1d5db",
                        backgroundColor: rispostaSelezionata === "1" ? "#2563eb" : "transparent",
                        justifyContent: "center", alignItems: "center"
                      }}>
                        {rispostaSelezionata === "1" && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff" }} />}
                      </View>
                    </CardHeader>
                  </Card>
                </Pressable>

                {/* Opzione 2 */}
                <Pressable onPress={() => setRispostaSelezionata("2")}>
                  <Card style={{ borderColor: rispostaSelezionata === "2" ? "#2563eb" : "#e5e7eb", borderWidth: 2, borderRadius: 16, backgroundColor: rispostaSelezionata === "2" ? "#eff6ff" : "#ffffff" }}>
                    <CardHeader style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <CardTitle style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>{tutteDomande[domandaCorrente]?.ans_text?.cardTitolo2}</CardTitle>
                        <CardDescription style={{ color: "#4b5563", fontSize: 13, marginTop: 4, lineHeight: 18 }}>{tutteDomande[domandaCorrente]?.ans_text?.cardDescrizione2}</CardDescription>
                      </View>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                        borderColor: rispostaSelezionata === "2" ? "#2563eb" : "#d1d5db",
                        backgroundColor: rispostaSelezionata === "2" ? "#2563eb" : "transparent",
                        justifyContent: "center", alignItems: "center"
                      }}>
                        {rispostaSelezionata === "2" && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff" }} />}
                      </View>
                    </CardHeader>
                  </Card>
                </Pressable>

                {/* Opzione 3 */}
                <Pressable onPress={() => setRispostaSelezionata("3")}>
                  <Card style={{ borderColor: rispostaSelezionata === "3" ? "#2563eb" : "#e5e7eb", borderWidth: 2, borderRadius: 16, backgroundColor: rispostaSelezionata === "3" ? "#eff6ff" : "#ffffff" }}>
                    <CardHeader style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <CardTitle style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>{tutteDomande[domandaCorrente]?.ans_text?.cardTitolo3}</CardTitle>
                        <CardDescription style={{ color: "#4b5563", fontSize: 13, marginTop: 4, lineHeight: 18 }}>{tutteDomande[domandaCorrente]?.ans_text?.cardDescrizione3}</CardDescription>
                      </View>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                        borderColor: rispostaSelezionata === "3" ? "#2563eb" : "#d1d5db",
                        backgroundColor: rispostaSelezionata === "3" ? "#2563eb" : "transparent",
                        justifyContent: "center", alignItems: "center"
                      }}>
                        {rispostaSelezionata === "3" && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff" }} />}
                      </View>
                    </CardHeader>
                  </Card>
                </Pressable>

              </View>
            </View>
          </>
        )}

        {/* Gruppo Bottoni Azione Inferiori */}
        <View style={{ gap: 10, marginTop: 10 }}>
          <Button
            style={{ backgroundColor: (!quizFinito && rispostaSelezionata === "") ? "#93c5fd" : "#2563eb", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", width: "100%", elevation: 0 }}
            onPress={avanza}
            disabled={!quizFinito && rispostaSelezionata === ""}
            className="w-full"
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
              {quizFinito ? "Chiudi" : domandaCorrente === tutteDomande.length - 1 ? "Fine" : "Avanti →"}
            </Text>
          </Button>

          {!quizFinito && domandaCorrente > 0 && (
            <Pressable
              onPress={indietro}
              style={{ paddingVertical: 12, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#4b5563", fontSize: 15, fontWeight: "600" }}>← Indietro</Text>
            </Pressable>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}