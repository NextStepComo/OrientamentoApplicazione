// app/(protected)/(tabs)/contenuti.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { Animated, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AltRow,
  MatchBar,
  Section,
  StatCard,
  useFadeSlideIn,
} from "@/components/ui/contentReusable";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import quizResultData from "@/constants/quizResultData.json";
import { useAuth } from "@/context/AuthContext";

export default function ContenutiScreen() {
  const insets = useSafeAreaInsets();
  const heroStyle = useFadeSlideIn(100, 16);
  const {rifaiQuestionario} = useAuth();
  const handleRedoQuestionario = () => {
    rifaiQuestionario();
  };

  return (
    <View
      className="flex-1 bg-[#F5F7FA]"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HERO BANNER ── */}
        <Animated.View
          style={[heroStyle]}
          className="mx-4 mt-4 mb-2 p-6 rounded-3xl bg-[#066CF4] items-center justify-center relative overflow-hidden shadow-md"
        >
          {/* Cerchi decorativi */}
          <View className="absolute w-40 h-40 rounded-full bg-white/10 -top-12 -left-10" />
          <View className="absolute w-32 h-32 rounded-full bg-white/5 -bottom-8 -right-6" />

          <Text className="text-white/80 text-[10px] font-black tracking-widest uppercase mb-1.5">
            {quizResultData.hero.eyebrow}
          </Text>
          <Text className="text-5xl mb-2">{quizResultData.hero.emoji}</Text>
          <Text className="text-3xl font-black text-white tracking-tight mb-3">
            {quizResultData.hero.name}
          </Text>

          <Badge className="bg-white/20 border border-white/30 px-3.5 py-1 rounded-full flex-row items-center gap-1.5">
            <MaterialIcons name="check-circle" size={13} color="#FFFFFF" />
            <Text className="text-white text-xs font-black">
              {quizResultData.hero.compatibility}
            </Text>
          </Badge>
        </Animated.View>

        {/* ── MATCH CON IL PROFILO ── */}
        <Section icon="chart-bar" title="Match con il tuo profilo">
          <Card className="bg-white border border-[#CCDFFD] p-4 rounded-2xl shadow-sm">
            {quizResultData.matchBars.map((b) => (
              <MatchBar
                key={b.label}
                label={b.label}
                pct={b.pct}
                color={b.color}
                delay={b.delay}
              />
            ))}
          </Card>
        </Section>

        {/* ── NUMERI ── */}
        <Section icon="trending-up" title="Numeri per il tuo futuro">
          <View className="flex-row gap-2.5">
            {quizResultData.stats.map((s, i) => (
              <StatCard key={i} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </View>
        </Section>

        {/* ── PERCHÉ QUESTO INDIRIZZO ── */}
        <Section icon="information" title="Perché questo indirizzo">
          <Card className="bg-[#E6F0FE] border border-[#CCDFFD]/60 p-4 rounded-2xl">
            <Text className="text-sm text-[#334155] font-medium leading-relaxed">
              {quizResultData.description}
            </Text>
          </Card>
        </Section>

        {/* ── MATERIE PRINCIPALI ── */}
        <Section
          icon="book-open-variant"
          title="Materie principali"
          count={`${quizResultData.subjects.length} materie`}
        >
          <View className="flex-row flex-wrap gap-2">
            {quizResultData.subjects.map((m) => (
              <Badge
                key={m}
                className="bg-white border border-[#CCDFFD] px-3 py-1.5 rounded-xl"
              >
                <Text className="text-xs font-bold text-[#1A2433]">{m}</Text>
              </Badge>
            ))}
          </View>
        </Section>

        {/* ── SBOCCHI PROFESSIONALI ── */}
        <Section icon="id-card" title="Sbocchi professionali">
          <View className="flex-row flex-wrap gap-2">
            {quizResultData.jobs.map((j) => (
              <Badge
                key={j}
                className="bg-[#E6F0FE] border border-[#066CF4]/20 px-3 py-1.5 rounded-xl"
              >
                <Text className="text-xs font-black text-[#066CF4]">{j}</Text>
              </Badge>
            ))}
          </View>
        </Section>

        {/* ── ALTRI INDIRIZZI COMPATIBILI ── */}
        <Section icon="apps" title="Altri indirizzi compatibili">
          {quizResultData.alternativeItems.map((a) => (
            <AltRow
              key={a.name}
              emoji={a.emoji}
              name={a.name}
              meta={a.meta}
              pct={a.pct}
            />
          ))}
        </Section>

        {/* ── AZIONI FINALI ── */}
        <View className="mx-4 mt-6 gap-3">
          <Button
            size="lg"
            className="bg-[#066CF4] rounded-2xl h-14 w-full flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
          >
            <MaterialIcons name="map" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-bold">
              Cerca la scuola perfetta
            </Text>
          </Button>

          <TouchableOpacity
            className="w-full py-3 flex-row items-center justify-center gap-2 rounded-xl"
            activeOpacity={0.6}
          >
            <MaterialIcons name="refresh" size={18} color="#556070" />
            <Text className="text-sm font-bold text-[#556070]" onPress={handleRedoQuestionario}>
              Rifai il quiz di orientamento
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}