// app/(protected)/(tabs)/scuole.tsx
import { SearchBar, Section, SectionTitle, StatCard } from "@/components/ui/contentReusable";
import { Text } from "@/components/ui/text";
import listaScuole from "@/constants/listaScuole.json";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVBAR_HEIGHT = 80;

const DEFAULT_EXTRA = {
  tipo: "Istituto Scolastico",
  descrizione: "Informazioni dettagliate su questa scuola non ancora disponibili. Torna presto per scoprire corsi, statistiche e molto altro.",
  corsi: [] as string[],
  studenti: "—",
  fondazione: "—",
  indirizzo: "—",
  sito: "—",
};

const CORSO_COLORS = [
  { bg: "#E6F0FE", text: "#066CF4", border: "#CCDFFD" },
  { bg: "#FEF3E6", text: "#D97706", border: "#FDE68A" },
  { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  { bg: "#FDF2F8", text: "#9333EA", border: "#E9D5FF" },
  { bg: "#FFF1F2", text: "#E11D48", border: "#FECDD3" },
];

export default function ScuoleScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(id ?? null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (id) {
      setSelectedId(id);
    }
  }, [id]);

  const scuola = useMemo(() =>
    selectedId ? (listaScuole as any[]).find(s => s.id === selectedId) ?? null : null,
    [selectedId]
  );

  const extra = useMemo(() => {
    if (!scuola) return null;
    return {
      tipo: scuola.tipo ?? DEFAULT_EXTRA.tipo,
      descrizione: scuola.descrizione ?? DEFAULT_EXTRA.descrizione,
      corsi: scuola.corsi ?? DEFAULT_EXTRA.corsi,
      studenti: scuola.studenti ?? DEFAULT_EXTRA.studenti,
      fondazione: scuola.fondazione ?? DEFAULT_EXTRA.fondazione,
      indirizzo: scuola.indirizzo ?? DEFAULT_EXTRA.indirizzo,
      sito: scuola.sito ?? DEFAULT_EXTRA.sito,
    };
  }, [scuola]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return listaScuole as any[];
    const lower = searchQuery.toLowerCase();
    return (listaScuole as any[]).filter(s => s.name.toLowerCase().includes(lower));
  }, [searchQuery]);

  useEffect(() => {
    if (scuola) {
      fadeAnim.setValue(0);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      ]).start();
    }
  }, [scuola?.id]);

  const handleSelect = (s: any) => {
    setSelectedId(s.id);
    setSearchQuery("");
  };

  const handleBack = () => {
    setSelectedId(null);
    router.setParams({ id: undefined });
  };

  // ── Vista dettaglio scuola ────────────────────────────────────
  if (scuola && extra) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F7FA", paddingTop: insets.top }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: NAVBAR_HEIGHT + 24 }}
        >

          {/* Header hero */}
          <View className="bg-[#066CF4] px-5 pt-4 pb-8">
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              className="flex-row items-center gap-1.5 mb-5"
            >
              {/* arrow-back -> arrow-left */}
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
              <Text className="text-white text-sm font-bold">Tutte le scuole</Text>
            </TouchableOpacity>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mb-3">
                <MaterialCommunityIcons name="school" size={28} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-black text-white leading-tight mb-1">
                {scuola.name}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="px-2.5 py-1 bg-white/20 rounded-full">
                  <Text className="text-xs font-bold text-white">{extra.tipo}</Text>
                </View>
                <View className="px-2.5 py-1 bg-white/20 rounded-full flex-row items-center gap-1">
                  {/* location-on -> map-marker */}
                  <MaterialCommunityIcons name="map-marker" size={11} color="rgba(255,255,255,0.85)" />
                  <Text className="text-xs font-bold text-white/85">
                    {extra.indirizzo.split(",")[1]?.trim() ?? "—"}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Stat cards */}
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            className="flex-row gap-3 mx-4 -mt-5 mb-2"
          >
            {/* Corretti i nomi delle icone interne passate a StatCard */}
            <StatCard icon="account-group" value={extra.studenti} label="Studenti" />
            <StatCard icon="history" value={extra.fondazione} label="Fondazione" />
            <StatCard icon="book-open-variant" value={String(extra.corsi.length || "—")} label="Indirizzi" />
          </Animated.View>

          {/* Descrizione */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* info-outline -> information-outline */}
            <Section icon="information-outline" title="Chi siamo">
              <View className="bg-white border border-[#CCDFFD] rounded-2xl p-4 shadow-sm">
                <Text className="text-sm text-[#334155] leading-relaxed">
                  {extra.descrizione}
                </Text>
              </View>
            </Section>
          </Animated.View>

          {/* Corsi / Indirizzi */}
          {extra.corsi.length > 0 && (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {/* class -> google-classroom */}
              <Section icon="google-classroom" title="Indirizzi di studio">
                <View className="flex-row flex-wrap gap-2">
                  {extra.corsi.map((corso: string, i: number) => {
                    const c = CORSO_COLORS[i % CORSO_COLORS.length];
                    return (
                      <View
                        key={i}
                        className="px-4 py-2 rounded-2xl border"
                        style={{ backgroundColor: c.bg, borderColor: c.border }}
                      >
                        <Text className="text-sm font-black" style={{ color: c.text }}>
                          {corso}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Section>
            </Animated.View>
          )}

          {/* Info pratiche */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* place -> map-marker-outline */}
            <Section icon="map-marker-outline" title="Informazioni pratiche">
              <View className="bg-white border border-[#CCDFFD] rounded-2xl overflow-hidden shadow-sm">
                {[
                  { icon: "map-marker", label: "Indirizzo", value: extra.indirizzo },
                  { icon: "earth",      label: "Sito web",  value: extra.sito },
                  { icon: "crosshairs-gps", label: "Coordinate", value: `${scuola.position.lat.toFixed(4)}, ${scuola.position.lng.toFixed(4)}` },
                ].map((row, i, arr) => (
                  <View
                    key={i}
                    className={`flex-row items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#CCDFFD]" : ""}`}
                  >
                    <View className="w-8 h-8 rounded-xl bg-[#E6F0FE] items-center justify-center">
                      <MaterialCommunityIcons name={row.icon as any} size={16} color="#066CF4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-[#65758C] uppercase tracking-wide">{row.label}</Text>
                      <Text className="text-sm font-bold text-[#0B131F] mt-0.5">{row.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          </Animated.View>

          {/* CTA mappa */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="mx-4 mt-2">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/(protected)/(tabs)/mappe")}
              className="bg-white border border-[#CCDFFD] rounded-2xl h-12 flex-row items-center justify-center gap-2 shadow-sm"
            >
              <MaterialCommunityIcons name="map" size={18} color="#066CF4" />
              <Text className="text-[#066CF4] text-sm font-black">Vedi sulla mappa</Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </View>
    );
  }

  // ── Vista lista scuole ────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA", paddingTop: insets.top }}>

      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-black text-[#0B131F] mb-1">Scuole</Text>
        <Text className="text-sm text-[#65758C] mb-4">
          Esplora gli istituti disponibili in Lombardia
        </Text>
        <SearchBar
          placeholder="Cerca una scuola..."
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
      </View>

      {/* Contatore risultati */}
      <View className="px-4 mb-2">
        <SectionTitle
          icon="format-list-bulleted"
          title="Tutti gli istituti"
          count={`${filteredList.length}`}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={filteredList}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: NAVBAR_HEIGHT + 16 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }: { item: any }) => {
          const tipoScuola = item.tipo ?? DEFAULT_EXTRA.tipo;
          const corsiScuola = item.corsi ?? DEFAULT_EXTRA.corsi;

          return (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleSelect(item)}
              className="bg-white border border-[#CCDFFD] rounded-2xl p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-xl bg-[#E6F0FE] items-center justify-center">
                  <MaterialCommunityIcons name="school" size={22} color="#066CF4" />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-black text-[#0B131F] leading-snug" numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-[#65758C] mt-0.5">{tipoScuola}</Text>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={20} color="#CCDFFD" />
              </View>

              {/* Badge corsi */}
              {corsiScuola.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mt-3">
                  {corsiScuola.slice(0, 3).map((c: string, i: number) => {
                    const col = CORSO_COLORS[i % CORSO_COLORS.length];
                    return (
                      <View key={i} className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: col.bg, borderColor: col.border }}>
                        <Text className="text-[11px] font-bold" style={{ color: col.text }}>{c}</Text>
                      </View>
                    );
                  })}
                  {corsiScuola.length > 3 && (
                    <View className="px-2.5 py-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0]">
                      <Text className="text-[11px] font-bold text-[#65758C]">+{corsiScuola.length - 3}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}