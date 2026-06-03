// app/(protected)/(tabs)/contenuti.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Importazione dei dati dal file JSON statico
import quizResultData from "@/constants/quizResultData.json";

// Importazioni dai componenti della libreria React Native Reusable
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

const { width: SW } = Dimensions.get("window");

/* ─────────────────────────────────────────────
   TIPI
───────────────────────────────────────────── */
type MatchItem = {
  label: string;
  pct: number;
  color: string;
};

type AltItem = {
  emoji: string;
  name: string;
  meta: string;
  pct: number;
};

/* ─────────────────────────────────────────────
   COMPONENTI RIUTILIZZABILI (REUSABLE SYSTEM)
───────────────────────────────────────────── */

/** Barra di match animata coordinata con la palette */
function MatchBar({ label, pct, color, delay = 0 }: MatchItem & { delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 900,
      delay,
      useNativeDriver: true, // Prestazioni fluide native garantite
    }).start();
  }, [pct]);

  // Interpolazione basata su traduzione percentuale nativa
  // -100% significa che la barra è completamente nascosta a sinistra
  // Mappiamo il valore finale sottraendo la percentuale mancante
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', `${-100 + pct}%`],
  });

  return (
    <View className="flex-row items-center gap-3.5 mb-2.5">
      {/* Etichetta fissa */}
      <Text className="w-20 text-xs font-bold text-[#4B5563]">{label}</Text>
      
      {/* Tracciato di sfondo della barra (Ancoraggio sicuro) */}
      <View className="flex-1 h-2 bg-[#CCDFFD] rounded-full overflow-hidden relative">
        {/* Barra colorata animata tramite traslazione pura */}
        <Animated.View 
          style={{ 
            backgroundColor: color,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            transform: [{ translateX }]
          }} 
          className="rounded-full"
        />
      </View>
      
      {/* Percentuale numerica fissa */}
      <Text className="w-9 text-right text-xs font-black text-[#0B131F]">{pct}%</Text>
    </View>
  );
}

/** Card statistica Bento-Style basata su Card di Reusable */
function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <Card className="flex-1 items-center bg-white border border-[#CCDFFD] rounded-2xl p-3 shadow-sm">
      <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={20} color="#066CF4" />
      <Text className="text-lg font-black text-[#0B131F] mt-1 tracking-tight">{value}</Text>
      <Text className="text-[10px] font-bold text-[#65758C] text-center mt-0.5 uppercase tracking-wide">{label}</Text>
    </Card>
  );
}

/** Riga alternativa indirizzo compatibile */
function AltRow({ emoji, name, meta, pct }: AltItem) {
  return (
    <Card className="flex-row items-center gap-3 p-3.5 bg-white border border-[#CCDFFD] rounded-2xl mb-2 shadow-sm">
      <Text className="text-2xl w-8 text-center">{emoji}</Text>
      <View className="flex-1 justify-center">
        <Text className="text-sm font-bold text-[#1A2433] leading-snug">{name}</Text>
        <Text className="text-xs text-[#556070] mt-0.5">{meta}</Text>
      </View>
      {/* Badge compatto coordinato con sfondo Tinta 20% e testo 100% */}
      <Badge className="bg-[#CCDFFD] border-transparent px-2.5 py-1 rounded-full">
        <Text className="text-[#066CF4] text-xs font-black">{pct}%</Text>
      </Badge>
    </Card>
  );
}

/** Titolo di sezione tipografico standardizzato */
function SectionTitle({ icon, title, count }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; count?: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-3 mt-1">
      <MaterialIcons name={icon} size={18} color="#066CF4" />
      <Text className="text-base font-black text-[#0B131F] flex-1 tracking-tight">{title}</Text>
      {count && (
        <Badge variant="outline" className="border-[#CCDFFD] bg-transparent">
          <Text className="text-xs text-[#556070] font-semibold">{count}</Text>
        </Badge>
      )}
    </View>
  );
}

/* ─────────────────────────────────────────────
   SCHERMATA PRINCIPALE — Contenuti
───────────────────────────────────────────── */
export default function ContenutiScreen() {
  const insets = useSafeAreaInsets();
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 700,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const heroOpacity = heroAnim;
  const heroTranslate = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  return (
    <View className="flex-1 bg-[#F5F7FA]" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* ── HERO BANNER (Dati da JSON) ── */}
        <Animated.View
          style={[
            { opacity: heroOpacity, transform: [{ translateY: heroTranslate }] },
          ]}
          className="mx-4 mt-4 mb-2 p-6 rounded-3xl bg-[#066CF4] items-center justify-center relative overflow-hidden shadow-md"
        >
          {/* Cerchi decorativi geometrici translucidi */}
          <View className="absolute w-40 h-40 rounded-full bg-white/10 -top-12 -left-10" />
          <View className="absolute w-32 h-32 rounded-full bg-white/5 -bottom-8 -right-6" />

          <Text className="text-white/80 text-[10px] font-black tracking-widest uppercase mb-1.5">
            {quizResultData.hero.eyebrow}
          </Text>
          <Text className="text-5xl mb-2">{quizResultData.hero.emoji}</Text>
          <Text className="text-3xl font-black text-white tracking-tight mb-3">
            {quizResultData.hero.name}
          </Text>
          
          {/* Badge interno di compatibilità ad alto contrasto */}
          <Badge className="bg-white/20 border border-white/30 px-3.5 py-1 rounded-full flex-row items-center gap-1.5">
            <MaterialIcons name="check-circle" size={13} color="#FFFFFF" />
            <Text className="text-white text-xs font-black">{quizResultData.hero.compatibility}</Text>
          </Badge>
        </Animated.View>

        {/* ── SEZIONE: MATCH CON IL PROFILO (Dati da JSON) ── */}
        <View className="mx-4 mt-5">
          <SectionTitle icon="bar-chart" title="Match con il tuo profilo" />
          <Card className="bg-white border border-[#CCDFFD] p-4 rounded-2xl shadow-sm">
            {quizResultData.matchBars.map((b) => (
              <MatchBar key={b.label} label={b.label} pct={b.pct} color={b.color} delay={b.delay} />
            ))}
          </Card>
        </View>

        {/* ── SEZIONE: STAT CARDS (Dati da JSON) ── */}
        <View className="mx-4 mt-5">
          <SectionTitle icon="trending-up" title="Numeri per il tuo futuro" />
          <View className="flex-row gap-2.5">
            {quizResultData.stats.map((s, index) => (
              <StatCard key={index} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </View>
        </View>

        {/* ── SEZIONE: PERCHÉ QUESTO INDIRIZZO (Dati da JSON) ── */}
        <View className="mx-4 mt-5">
          <SectionTitle icon="info" title="Perché questo indirizzo" />
          <Card className="bg-[#E6F0FE] border border-[#CCDFFD]/60 p-4 rounded-2xl">
            <Text className="text-sm text-[#334155] font-medium leading-relaxed">
              {quizResultData.description}
            </Text>
          </Card>
        </View>

        {/* ── SEZIONE: MATERIE PRINCIPALI (Dati da JSON) ── */}
        <View className="mx-4 mt-5">
          <SectionTitle 
            icon="menu-book" 
            title="Materie principali" 
            count={`${quizResultData.subjects.length} materie`} 
          />
          <View className="flex-row flex-wrap gap-2">
            {quizResultData.subjects.map((m) => (
              <Badge key={m} className="bg-white border border-[#CCDFFD] px-3 py-1.5 rounded-xl">
                <Text className="text-xs font-bold text-[#1A2433]">{m}</Text>
              </Badge>
            ))}
          </View>
        </View>

        {/* ── SEZIONE: SBOCCHI PROFESSIONALI (Dati da JSON) ── */}
        <View className="mx-4 mt-5">
          <SectionTitle icon="badge" title="Sbocchi professionali" />
          <View className="flex-row flex-wrap gap-2">
            {quizResultData.jobs.map((j) => (
              <Badge key={j} className="bg-[#E6F0FE] border border-[#066CF4]/20 px-3 py-1.5 rounded-xl">
                <Text className="text-xs font-black text-[#066CF4]">{j}</Text>
              </Badge>
            ))}
          </View>
        </View>

        {/* ── SEZIONE: ALTRI INDIRIZZI COMPATIBILI (Dati da JSON) ── */}
        <View className="mx-4 mt-5">
          <SectionTitle icon="apps" title="Altri indirizzi compatibili" />
          {quizResultData.alternativeItems.map((a) => (
            <AltRow key={a.name} emoji={a.emoji} name={a.name} meta={a.meta} pct={a.pct} />
          ))}
        </View>

        {/* ── SEZIONE: INTERAZIONI / AZIONI FINALI ── */}
        <View className="mx-4 mt-6 gap-3">
          <Button
            size="lg"
            className="bg-[#066CF4] rounded-2xl h-14 w-full flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
          >
            <MaterialIcons name="map" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-bold">Cerca la scuola perfetta</Text>
          </Button>

          <TouchableOpacity 
            className="w-full py-3 flex-row items-center justify-center gap-2 rounded-xl"
            activeOpacity={0.6}
          >
            <MaterialIcons name="refresh" size={18} color="#556070" />
            <Text className="text-sm font-bold text-[#556070]">Rifai il quiz di orientamento</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}