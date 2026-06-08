// app/(protected)/(tabs)/scuole.tsx
import { SearchBar, Section, SectionTitle, StatCard } from "@/components/ui/contentReusable";
import { Text } from "@/components/ui/text";
import api from "@/utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from "react-native-safe-area-context";
const NAVBAR_HEIGHT = 80;

const DEFAULT_EXTRA = {
  tipo: "Istituto Scolastico",
  descrizione: "INFORMAZIONI NON ANCORA FORNITE",
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

  const [scuoleList, setScuoleList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(id ?? null);
  const [loading, setLoading] = useState(true);

  // Filtri
  const [selectedProvincia, setSelectedProvincia] = useState<string | null>(null);
  const [selectedIndirizzo, setSelectedIndirizzo] = useState<string | null>(null);
  const [showProvinciaModal, setShowProvinciaModal] = useState(false);
  const [showIndirizzoModal, setShowIndirizzoModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const [dateString, setDateString] = useState<string>('');
  const [dateStringMark1, setDateStringMark1] = useState<string>('');
  const [dateStringMark2, setDateStringMark2] = useState<string>('');

  //DATA DI OGGI PER CALENDARIO
  useEffect(() => {
    const today = new Date();
  
    const formatted = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(today);
  
    setDateString(formatted); // Outputs exactly "2026-06-08" using local time

    const date1 = new Date();
    date1.setDate(date1.getDate() + 5);
    const formatted1 = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date1);
  
    setDateStringMark1(formatted1);

    const date2 = new Date();
    date2.setDate(date2.getDate() + 13);
    const formatted2 = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date2);
  
    setDateStringMark2(formatted2);
  }, []);

  useEffect(() => {
    if (id) setSelectedId(id);
  }, [id]);

  useEffect(() => {
    api.get("/acquire/scuolePosizione?provincia=XX")
      .then(res => {
        const scuoleMapped = res.data.map((s: any) => {
          const emailRiferimento = s.indirizzo_email_sede_corsi || s.indirizzo_email_autonomia;
          const sitoWeb = emailRiferimento?.includes("@")
            ? `www.${emailRiferimento.split("@")[1]}`
            : "INFORMAZIONI NON ANCORA FORNITE";
          return {
            id: s.denominazione_sede_direttivo || s.denominazione || "—",
            name: s.denominazione_sede_direttivo || s.denominazione || "—",
            position: { lat: parseFloat(s.coory) || 0, lng: parseFloat(s.coorx) || 0 },
            tipo: s.tipologia_sede || s.tipologia || "INFORMAZIONI NON ANCORA FORNITE",
            descrizione: s.descrizione || "INFORMAZIONI NON ANCORA FORNITE",
            corsi: s.corsi || [],
            studenti: s.organico_sede ? String(s.organico_sede) : "INFORMAZIONI NON ANCORA FORNITE",
            fondazione: s.fondazione || "N/A",
            indirizzo: (s.indirizzo_sede_di_direttivo && s.comune_sede_di_direttivo)
              ? `${s.indirizzo_sede_di_direttivo}, ${s.cap_sede_dir || ""} ${s.comune_sede_di_direttivo} (${s.provincia || ""})`.trim()
              : "INFORMAZIONI NON ANCORA FORNITE",
            sito: sitoWeb,
            provincia: s.provincia || null,
          };
        });
        setScuoleList(scuoleMapped);
      })
      .catch(err => console.log("Status:", err.response?.status))
      .finally(() => setLoading(false));
  }, []);

  // Liste uniche per i filtri
  const province = useMemo(() =>
    [...new Set(scuoleList.map(s => s.provincia).filter(Boolean))].sort(),
    [scuoleList]
  );

  const indirizzi = useMemo(() =>
    [...new Set(scuoleList.flatMap(s => s.corsi ?? []).filter(Boolean))].sort(),
    [scuoleList]
  );

  const scuola = useMemo(() =>
    selectedId ? scuoleList.find(s => s?.id === selectedId) ?? null : null,
    [selectedId, scuoleList]
  );

  useEffect(() => {
    if (scuola) {
      fadeAnim.setValue(0);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedId, scuola]);

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
    let list = scuoleList;
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      list = list.filter(s => s?.name?.toLowerCase().includes(lower));
    }
    if (selectedProvincia) {
      list = list.filter(s => s.provincia === selectedProvincia);
    }
    if (selectedIndirizzo) {
      list = list.filter(s => s.corsi?.includes(selectedIndirizzo));
    }
    return list;
  }, [searchQuery, scuoleList, selectedProvincia, selectedIndirizzo]);

  const handleSelect = (s: any) => { setSelectedId(s.id); setSearchQuery(""); };
  const handleBack = () => { setSelectedId(null); router.setParams({ id: undefined }); };

  const activeFilters = [selectedProvincia, selectedIndirizzo].filter(Boolean).length;

  const getSchoolIcon = (s:any) => {
    if(s[0].slice(0,3) == 'I.P'){
      return "tools";
    }else if(s[0].slice(0,3) == 'I.T'){
      return "cogs";
    }else{
      return "school";
    }
  } 

  // ── Loading ───────────────────────────────────────────────────
  if (loading && selectedId) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center", paddingTop: insets.top }}>
        <MaterialCommunityIcons name="school" size={40} color="#CCDFFD" />
        <Text className="text-sm text-[#65758C] mt-3">Caricamento scuola...</Text>
      </View>
    );
  }

  // ── Vista Dettaglio ───────────────────────────────────────────
  if (scuola && extra) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F7FA", paddingTop: insets.top }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: NAVBAR_HEIGHT + 24 }}>
          <View className="bg-[#066CF4] px-5 pt-4 pb-8">
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7} className="flex-row items-center gap-1.5 mb-5">
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
              <Text className="text-white text-sm font-bold">Tutte le scuole</Text>
            </TouchableOpacity>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mb-3">
                <MaterialCommunityIcons name="school" size={28} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-black text-white leading-tight mb-1">{scuola.name}</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="px-2.5 py-1 bg-white/20 rounded-full">
                  <Text className="text-xs font-bold text-white">{extra.tipo}</Text>
                </View>
                <View className="px-2.5 py-1 bg-white/20 rounded-full flex-row items-center gap-1">
                  <MaterialCommunityIcons name="map-marker" size={11} color="rgba(255,255,255,0.85)" />
                  <Text className="text-xs font-bold text-white/85">{extra.indirizzo.split(",")[1]?.trim() ?? "—"}</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="flex-row gap-3 mx-4 -mt-5 mb-2">
            <StatCard icon="account-group" value={extra.studenti} label="Organico" />
            <StatCard icon="history" value={extra.fondazione} label="Fondazione" />
            <StatCard icon="book-open-variant" value={String(extra.corsi.length || "—")} label="Indirizzi" />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Section icon="information-outline" title="Chi siamo">
              <View className="bg-white border border-[#CCDFFD] rounded-2xl p-4 shadow-sm">
                <Text className="text-sm text-[#334155] leading-relaxed">{extra.descrizione}</Text>
              </View>
            </Section>
          </Animated.View>

          {extra.corsi.length > 0 && (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Section icon="google-classroom" title="Indirizzi di studio">
                <View className="flex-row flex-wrap gap-2">
                  {extra.corsi.map((corso: string, i: number) => {
                    const c = CORSO_COLORS[i % CORSO_COLORS.length];
                    return (
                      <View key={i} className="px-4 py-2 rounded-2xl border" style={{ backgroundColor: c.bg, borderColor: c.border }}>
                        <Text className="text-sm font-black" style={{ color: c.text }}>{corso}</Text>
                      </View>
                    );
                  })}
                </View>
              </Section>
            </Animated.View>
          )}

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Section icon="human-handsup" title="Open Days">
              <View className="bg-white border border-[#CCDFFD] rounded-2xl p-4 shadow-sm">
              <Calendar
                style={{
                  borderWidth: 1,
                  borderColor: 'white',
                  height: 350
                }}
                current={dateString}
                onDayPress={day => {
                  console.log('selected day', day);
                }}
                markedDates={{
                  [dateStringMark1]: {selected: true, marked: true, selectedColor: 'orange'},
                  [dateStringMark2]: {selected: true, marked: true, selectedColor: 'red'}
                }}
              />  
            </View>
            </Section>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Section icon="map-marker-outline" title="Informazioni pratiche">
              <View className="bg-white border border-[#CCDFFD] rounded-2xl overflow-hidden shadow-sm">
                {[
                  { icon: "map-marker", label: "Indirizzo", value: extra.indirizzo },
                  { icon: "earth", label: "Sito web", value: extra.sito },
                  { icon: "crosshairs-gps", label: "Coordinate", value: scuola.position?.lat && scuola.position?.lng ? `${scuola.position.lat.toFixed(4)}, ${scuola.position.lng.toFixed(4)}` : "—" },
                ].map((row, i, arr) => (
                  <View key={i} className={`flex-row items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#CCDFFD]" : ""}`}>
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

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="mx-4 mt-2">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: "/(protected)/(tabs)/mappe", params: { lat: String(scuola.position.lat), lng: String(scuola.position.lng), zoom: "15" } })}
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

  // ── Vista Lista ───────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA", paddingTop: insets.top }}>

      {/* Modali filtri */}
      {[
        { visible: showProvinciaModal, onClose: () => setShowProvinciaModal(false), title: "Provincia", items: province, selected: selectedProvincia, onSelect: setSelectedProvincia },
        { visible: showIndirizzoModal, onClose: () => setShowIndirizzoModal(false), title: "Indirizzo", items: indirizzi, selected: selectedIndirizzo, onSelect: setSelectedIndirizzo },
      ].map(({ visible, onClose, title, items, selected, onSelect }) => (
        <Modal key={title} visible={visible} transparent animationType="slide" onRequestClose={onClose}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} activeOpacity={1} onPress={onClose} />
          <View className="bg-white rounded-t-3xl p-5" style={{ maxHeight: "70%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-black text-[#0B131F]">Filtra per {title}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={22} color="#65758C" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => { onSelect(null); onClose(); }}
                className={`flex-row items-center justify-between px-4 py-3 rounded-2xl mb-2 border ${!selected ? "bg-[#E6F0FE] border-[#CCDFFD]" : "bg-white border-[#CCDFFD]"}`}
              >
                <Text className={`text-sm font-bold ${!selected ? "text-[#066CF4]" : "text-[#0B131F]"}`}>Tutti</Text>
                {!selected && <MaterialCommunityIcons name="check" size={18} color="#066CF4" />}
              </TouchableOpacity>
              {items.map((item: string) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => { onSelect(item); onClose(); }}
                  className={`flex-row items-center justify-between px-4 py-3 rounded-2xl mb-2 border ${selected === item ? "bg-[#E6F0FE] border-[#CCDFFD]" : "bg-white border-[#CCDFFD]"}`}
                >
                  <Text className={`text-sm font-bold ${selected === item ? "text-[#066CF4]" : "text-[#0B131F]"}`}>{item}</Text>
                  {selected === item && <MaterialCommunityIcons name="check" size={18} color="#066CF4" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      ))}

      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-black text-[#0B131F] mb-1">Scuole</Text>
        <Text className="text-sm text-[#65758C] mb-4">Esplora gli istituti disponibili in Lombardia</Text>
        <SearchBar placeholder="Cerca una scuola..." onSearch={setSearchQuery} onClear={() => setSearchQuery("")} />

        {/* Bottoni filtro */}
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            onPress={() => setShowProvinciaModal(true)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${selectedProvincia ? "bg-[#066CF4] border-[#066CF4]" : "bg-white border-[#CCDFFD]"}`}
          >
            <MaterialCommunityIcons name="map-marker" size={14} color={selectedProvincia ? "#FFFFFF" : "#066CF4"} />
            <Text className={`text-xs font-bold ${selectedProvincia ? "text-white" : "text-[#066CF4]"}`}>
              {selectedProvincia ?? "Provincia"}
            </Text>
            {selectedProvincia && (
              <TouchableOpacity onPress={() => setSelectedProvincia(null)}>
                <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowIndirizzoModal(true)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${selectedIndirizzo ? "bg-[#066CF4] border-[#066CF4]" : "bg-white border-[#CCDFFD]"}`}
          >
            <MaterialCommunityIcons name="book-open-variant" size={14} color={selectedIndirizzo ? "#FFFFFF" : "#066CF4"} />
            <Text className={`text-xs font-bold ${selectedIndirizzo ? "text-white" : "text-[#066CF4]"}`} numberOfLines={1}>
              {selectedIndirizzo ?? "Indirizzo"}
            </Text>
            {selectedIndirizzo && (
              <TouchableOpacity onPress={() => setSelectedIndirizzo(null)}>
                <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {activeFilters > 0 && (
            <TouchableOpacity
              onPress={() => { setSelectedProvincia(null); setSelectedIndirizzo(null); }}
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border border-[#FECDD3] bg-[#FFF1F2]"
            >
              <MaterialCommunityIcons name="filter-off" size={14} color="#E11D48" />
              <Text className="text-xs font-bold text-[#E11D48]">Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-4 mb-2">
        <SectionTitle icon="format-list-bulleted" title="Tutti gli istituti" count={`${filteredList.length}`} />
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item: any, index: number) => item?.id ?? String(index)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: NAVBAR_HEIGHT + 16 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }: { item: any }) => {
          const corsiScuola = item?.corsi ?? [];
          return (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleSelect(item)}
              className="bg-white border border-[#CCDFFD] rounded-2xl p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-xl bg-[#E6F0FE] items-center justify-center">
                  <MaterialCommunityIcons name={getSchoolIcon(corsiScuola)} size={22} color="#066CF4" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-[#0B131F] leading-snug" numberOfLines={2}>{item?.name}</Text>
                  <Text className="text-xs text-[#65758C] mt-0.5">{item?.tipo ?? "INFORMAZIONI NON ANCORA FORNITE"}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#CCDFFD" />
              </View>

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