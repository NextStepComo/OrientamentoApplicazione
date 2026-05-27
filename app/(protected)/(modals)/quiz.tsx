// app/(protected)/(modals)/quiz.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import DOMANDE from "@/data/domande.json";
import "@/global.css";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default async function QuizScreen() {
  const [domandaCorrente, setDomandaCorrente] = useState(0);
  const [rispostaSelezionata, setRispostaSelezionata] = useState<string>("");
  const [risposteSalvate, setRisposteSalvate] = useState<string[]>([]);
  const [quizFinito, setQuizFinito] = useState<boolean>(false);

  const [nomeUtente, setNomeUtente] = useState<string | null>("");

  useEffect(() => {
    async function caricaNomeUtente() {
      try {
        const name = await SecureStore.getItemAsync("full_name");
        setNomeUtente(name || "Utente"); // Aggiorno lo stato col nome trovato
      } catch (error) {
        setNomeUtente("Utente");
      }
    }
    caricaNomeUtente();
  }, []);

  const avanza = () => {
    const nuoveRisposte = [...risposteSalvate]; //con ... prende tutti gli elem di risposteSalvate e li copia in nuoveRisposte
    nuoveRisposte[domandaCorrente] = rispostaSelezionata;
    setRisposteSalvate(nuoveRisposte);

    if (domandaCorrente < DOMANDE.length - 1) {
      setDomandaCorrente(domandaCorrente + 1);
      // Se avevamo già risposto alla domanda successiva (tornando indietro), ricarica la risposta
      setRispostaSelezionata(risposteSalvate[domandaCorrente + 1] || ""); 
    } else {
      setQuizFinito(true);
    }
  };

  const indietro = () => {
    if (domandaCorrente > 0) {
      const paginaPrecedente = domandaCorrente - 1;
      setDomandaCorrente(paginaPrecedente);
      setRispostaSelezionata(risposteSalvate[paginaPrecedente] || "");
    }
  };

  const progresso = ((domandaCorrente + 1) / DOMANDE.length) * 100;
  

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
              {DOMANDE.map((domanda, index) => {
                const valoreRisposta = risposteSalvate[index];
                let testoRisposta = "";
                if (valoreRisposta === "1") testoRisposta = domanda.cardTitolo1;
                if (valoreRisposta === "2") testoRisposta = domanda.cardTitolo2;
                if (valoreRisposta === "3") testoRisposta = domanda.cardTitolo3;

                return (
                  <Card key={domanda.id} style={{ borderColor: "#e5e7eb", borderWidth: 2, borderRadius: 16, backgroundColor: "#ffffff" }}>
                    <CardHeader style={{ padding: 16, gap: 4 }}>
                      <Text style={{ color: "#4b5563", fontSize: 13, fontWeight: "600" }}>{domanda.testo}</Text>
                      <Text style={{ color: "#2563eb", fontSize: 15, fontWeight: "700" }}>{testoRisposta}</Text>
                    </CardHeader>
                  </Card>
                );
              })}
            </View>
          </View>
        )
        
        :
        
        ( //else di quizFinito
          /* Schermata Quiz attiva */
          <> {/*Per mantenere il codice con i View separati se no il justifyContent: center non andrebbe */}
            {/* Header */}
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#4b5563", fontSize: 14, fontWeight: "500" }}>
                  Quiz di orientamento
                </Text>
                <View style={{ backgroundColor: "#e0f2fe", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ color: "#0369a1", fontSize: 13, fontWeight: "700" }}>
                    {domandaCorrente + 1} / {DOMANDE.length}
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
                Ciao {nomeUtente}! 
              </Text>
              {/* Domanda ravvicinata */}
              <View style={{ gap: 6, marginBottom: 20 }}>
                <Text style={{ color: "#6b7280", fontSize: 13, fontWeight: "600", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Domanda {domandaCorrente + 1}
                </Text>
                <Text style={{ color: "#111827", fontSize: 26, fontWeight: "800", lineHeight: 34, letterSpacing: -0.5 }}>
                  {DOMANDE[domandaCorrente].testo}
                </Text>
              </View>

              {/* Card risposte */}
              <View style={{ gap: 12 }}>
                
                {/* Opzione 1 */}
                <Pressable onPress={() => setRispostaSelezionata("1")}>
                  <Card style={{ borderColor: rispostaSelezionata === "1" ? "#2563eb" : "#e5e7eb", borderWidth: 2, borderRadius: 16, backgroundColor: rispostaSelezionata === "1" ? "#eff6ff" : "#ffffff" }}>
                    <CardHeader style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <CardTitle style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>{DOMANDE[domandaCorrente].cardTitolo1}</CardTitle>
                        <CardDescription style={{ color: "#4b5563", fontSize: 13, marginTop: 4, lineHeight: 18 }}>{DOMANDE[domandaCorrente].cardDescrizione1}</CardDescription>
                      </View>
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: rispostaSelezionata === "1" ? "#2563eb" : "#d1d5db",// funzione con if else come prima
                        backgroundColor: rispostaSelezionata === "1" ? "#2563eb" : "transparent",
                        justifyContent: "center",
                        alignItems: "center"
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
                        <CardTitle style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>{DOMANDE[domandaCorrente].cardTitolo2}</CardTitle>
                        <CardDescription style={{ color: "#4b5563", fontSize: 13, marginTop: 4, lineHeight: 18 }}>{DOMANDE[domandaCorrente].cardDescrizione2}</CardDescription>
                      </View>
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: rispostaSelezionata === "2" ? "#2563eb" : "#d1d5db",
                        backgroundColor: rispostaSelezionata === "2" ? "#2563eb" : "transparent",
                        justifyContent: "center",
                        alignItems: "center"
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
                        <CardTitle style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>{DOMANDE[domandaCorrente].cardTitolo3}</CardTitle>
                        <CardDescription style={{ color: "#4b5563", fontSize: 13, marginTop: 4, lineHeight: 18 }}>{DOMANDE[domandaCorrente].cardDescrizione3}</CardDescription>
                      </View>
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: rispostaSelezionata === "3" ? "#2563eb" : "#d1d5db",
                        backgroundColor: rispostaSelezionata === "3" ? "#2563eb" : "transparent",
                        justifyContent: "center",
                        alignItems: "center"
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
              {quizFinito ? "Chiudi" : domandaCorrente === DOMANDE.length - 1 ? "Fine" : "Avanti →"}
            </Text>
          </Button>

          {/* Mostra il pulsante "Indietro" solo se non siamo alla prima pagina e se il quiz non è finito */}
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