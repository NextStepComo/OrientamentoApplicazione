// app/(protected)/(tabs)/contenuti.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ─────────────────────────────────────────────
   TOKENS — fedeli alla palette ufficiale
───────────────────────────────────────────── */
const C = {
  nsBlue: "#066CF4",
  nsBlueBright: "#2F7DF6",
  nsBlueGlow: "#5B9CFF",
  nsBluePale: "#DCE8FF",
  nsBlue50: "#F0F5FF",
  nsInk: "#0B1220",
  nsDark: "#1F2937",
  bg: "#F4F8FF",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF4FF",
  line: "rgba(31,41,55,0.08)",
  lineStrong: "rgba(31,41,55,0.14)",
  textSoft: "#4B5563",
  textMute: "#8893A7",
  green: "#10B981",
  greenSoft: "#ECFDF5",
  warm: "#F59E0B",
  warmSoft: "#FEF3C7",
  purple: "#8B5CF6",
  purpleSoft: "#F3E8FF",
  pink: "#EC4899",
  pinkSoft: "#FCE7F3",
};

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
   COMPONENTI RIUTILIZZABILI
───────────────────────────────────────────── */

/** Chip pill — tag colorato */
function Chip({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "green" | "warm" | "purple" | "pink" | "solid";
}) {
  const styles = {
    default: { bg: C.surfaceAlt, text: C.nsInk, border: C.line },
    solid:   { bg: C.nsBlue,    text: "#fff",   border: "transparent" },
    green:   { bg: C.greenSoft, text: C.green,  border: "rgba(16,185,129,0.2)" },
    warm:    { bg: C.warmSoft,  text: "#B45309", border: "rgba(245,158,11,0.25)" },
    purple:  { bg: C.purpleSoft,text: C.purple, border: "rgba(139,92,246,0.25)" },
    pink:    { bg: C.pinkSoft,  text: C.pink,   border: "rgba(236,72,153,0.2)" },
  };
  const s = styles[variant];
  return (
    <View
      style={[
        chipStyles.root,
        { backgroundColor: s.bg, borderColor: s.border },
      ]}
    >
      <Text style={[chipStyles.text, { color: s.text }]}>{label}</Text>
    </View>
  );
}
const chipStyles = StyleSheet.create({
  root: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  text: { fontSize: 12.5, fontWeight: "600" },
});

/** Barra di match animata */
function MatchBar({
  label,
  pct,
  color,
  delay = 0,
}: MatchItem & { delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct / 100,
      duration: 900,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);
  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${pct}%`],
  });
  return (
    <View style={mbStyles.row}>
      <Text style={mbStyles.label}>{label}</Text>
      <View style={mbStyles.track}>
        <Animated.View
          style={[mbStyles.fill, { width, backgroundColor: color }]}
        />
      </View>
      <Text style={mbStyles.pct}>{pct}%</Text>
    </View>
  );
}
const mbStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 },
  label: { width: 76, fontSize: 12, color: C.textSoft, fontWeight: "600" },
  track: {
    flex: 1,
    height: 7,
    backgroundColor: C.surfaceAlt,
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 99 },
  pct: {
    width: 34,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "800",
    color: C.nsInk,
  },
});

/** Card statistica (3 in riga) */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={scStyles.root}>
      <MaterialIcons name={icon} size={20} color={C.nsBlue} />
      <Text style={scStyles.num}>{value}</Text>
      <Text style={scStyles.label}>{label}</Text>
    </View>
  );
}
const scStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 3,
    shadowColor: "#0F1729",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: C.line,
  },
  num: {
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-condensed" }),
    fontSize: 18,
    fontWeight: "800",
    color: C.nsInk,
  },
  label: { fontSize: 10, color: C.textMute, fontWeight: "600", textAlign: "center" },
});

/** Riga alternativa indirizzo */
function AltRow({ emoji, name, meta, pct }: AltItem) {
  return (
    <View style={arStyles.root}>
      <Text style={arStyles.emoji}>{emoji}</Text>
      <View style={arStyles.info}>
        <Text style={arStyles.name}>{name}</Text>
        <Text style={arStyles.meta}>{meta}</Text>
      </View>
      <View style={arStyles.badge}>
        <Text style={arStyles.badgeText}>{pct}%</Text>
      </View>
    </View>
  );
}
const arStyles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 11,
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 7,
    shadowColor: "#0F1729",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    borderWidth: 1,
    borderColor: C.line,
  },
  emoji: { fontSize: 22, width: 32, textAlign: "center" },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: "700", color: C.nsInk },
  meta: { fontSize: 11.5, color: C.textSoft, marginTop: 1 },
  badge: {
    backgroundColor: C.nsBluePale,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12.5, fontWeight: "800", color: C.nsBlue },
});

/** Badge hero (risultato AI) */
function ResultHeroBadge({ label }: { label: string }) {
  return (
    <View style={rhbStyles.root}>
      <MaterialIcons name="check-circle" size={14} color="#fff" />
      <Text style={rhbStyles.text}>{label}</Text>
    </View>
  );
}
const rhbStyles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16,185,129,0.92)",
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 999,
    shadowColor: C.green,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  text: { fontSize: 12, fontWeight: "700", color: "#fff" },
});

/** Titolo di sezione */
function SectionTitle({
  icon,
  title,
  count,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  count?: string;
}) {
  return (
    <View style={stStyles.root}>
      <MaterialIcons name={icon} size={18} color={C.nsBlue} />
      <Text style={stStyles.text}>{title}</Text>
      {count ? <Text style={stStyles.count}>{count}</Text> : null}
    </View>
  );
}
const stStyles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  text: { fontSize: 15, fontWeight: "700", color: C.nsInk, flex: 1 },
  count: { fontSize: 12, color: C.textMute, fontWeight: "600" },
});

/** Bottone primario */
function PrimaryButton({
  label,
  icon,
  onPress,
  style,
}: {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  style?: object;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], ...style }}>
      <TouchableOpacity onPress={press} activeOpacity={0.9} style={pbStyles.root}>
        {icon && <MaterialIcons name={icon} size={20} color="#fff" />}
        <Text style={pbStyles.text}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const pbStyles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: C.nsBlue,
    shadowColor: C.nsBlue,
    shadowOpacity: 0.34,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  text: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

/* ─────────────────────────────────────────────
   SCHERMATA PRINCIPALE — Contenuti
   Mostra il risultato del quiz AI (indirizzo Informatico)
   con tutte le sezioni del mockup HTML screen-result
───────────────────────────────────────────── */
const MATCH_BARS: (MatchItem & { delay: number })[] = [
  { label: "Logica",    pct: 95, color: C.nsBlue,  delay: 200 },
  { label: "Pratica",   pct: 88, color: C.green,   delay: 350 },
  { label: "Creatività",pct: 72, color: C.purple,  delay: 500 },
  { label: "Sociale",   pct: 48, color: C.warm,    delay: 650 },
];

const ALT_ITEMS: AltItem[] = [
  { emoji: "⚡", name: "Elettronica ed Elettrotecnica", meta: "Tecnologico · più hardware",       pct: 82 },
  { emoji: "🎬", name: "Grafica e Comunicazione",       meta: "Tecnologico · creativo + digitale", pct: 71 },
  { emoji: "🔬", name: "Scientifico — Sc. Applicate",  meta: "Liceo · matematica + informatica",  pct: 68 },
];

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
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ── */}
        <Animated.View
          style={[
            s.hero,
            { opacity: heroOpacity, transform: [{ translateY: heroTranslate }] },
          ]}
        >
          {/* decorative circles */}
          <View style={s.heroCircle1} />
          <View style={s.heroCircle2} />

          <Text style={s.heroEyebrow}>Il tuo indirizzo ideale</Text>
          <Text style={s.heroEmoji}>💻</Text>
          <Text style={s.heroName}>Informatico</Text>
          <ResultHeroBadge label="95% compatibilità" />
        </Animated.View>

        {/* ── MATCH BARS ── */}
        <View style={s.section}>
          <SectionTitle icon="bar-chart" title="Match con il tuo profilo" />
          {MATCH_BARS.map((b) => (
            <MatchBar key={b.label} {...b} />
          ))}
        </View>

        {/* ── STAT CARDS ── */}
        <View style={s.section}>
          <SectionTitle icon="trending-up" title="Numeri per il tuo futuro" />
          <View style={s.statsRow}>
            <StatCard icon="work"           value="92%" label="Domanda lavoro"    />
            <StatCard icon="euro-symbol"    value="€38k" label="Stipendio iniziale" />
            <StatCard icon="school"         value="+18%" label="Crescita 2024–29"  />
          </View>
        </View>

        {/* ── PERCHÉ ── */}
        <View style={s.section}>
          <SectionTitle icon="info" title="Perché questo indirizzo" />
          <Text style={s.desc}>
            Ti formerà come tecnico dei sistemi digitali, programmatore e
            analista. Lavorerai con reti, database e sviluppo software — le
            competenze più richieste in Italia.
          </Text>
        </View>

        {/* ── MATERIE ── */}
        <View style={s.section}>
          <SectionTitle icon="menu-book" title="Materie principali" count="5 materie" />
          <View style={s.chipsWrap}>
            {["Sistemi e Reti", "Informatica", "TPSIT", "Matematica", "Inglese Tecnico"].map(
              (m) => <Chip key={m} label={m} />
            )}
          </View>
        </View>

        {/* ── SBOCCHI ── */}
        <View style={s.section}>
          <SectionTitle icon="badge" title="Sbocchi professionali" />
          <View style={s.chipsWrap}>
            {["Sviluppatore", "Sistemista", "Cybersecurity", "Data Analyst", "Cloud Engineer"].map(
              (m) => <Chip key={m} label={m} variant="green" />
            )}
          </View>
        </View>

        {/* ── ALTRI INDIRIZZI ── */}
        <View style={s.section}>
          <SectionTitle icon="apps" title="Altri indirizzi compatibili" />
          {ALT_ITEMS.map((a) => <AltRow key={a.name} {...a} />)}
        </View>

        {/* ── AZIONI ── */}
        <View style={[s.section, { gap: 10 }]}>
          <PrimaryButton icon="map" label="Cerca la scuola perfetta" />
          <TouchableOpacity style={s.ghostBtn} activeOpacity={0.7}>
            <MaterialIcons name="refresh" size={18} color={C.textSoft} />
            <Text style={s.ghostText}>Rifai il quiz</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────
   STILI SCHERMATA
───────────────────────────────────────────── */
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  /* Hero card */
  hero: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: C.nsBlue,
    alignItems: "center",
    gap: 0,
    overflow: "hidden",
    shadowColor: C.nsBlue,
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -50,
    left: -40,
  },
  heroCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -30,
    right: -20,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.80)",
    marginBottom: 6,
  },
  heroEmoji: {
    fontSize: 52,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 10,
  },

  /* Sections */
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  desc: {
    fontSize: 13,
    color: C.textSoft,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },

  /* Ghost button */
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ghostText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textSoft,
  },
});