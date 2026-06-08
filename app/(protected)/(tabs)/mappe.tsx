// app/(protected)/(tabs)/mappe.tsx
import { SearchBar } from "@/components/ui/contentReusable";
import { Text } from "@/components/ui/text";
import api from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Keyboard, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { LatLng, LeafletView, MapMarker, WebViewLeafletEvents, WebviewLeafletMessage } from 'react-native-leaflet-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_LOCATION: LatLng = { lat: 45.4741, lng: 9.1892 };
const CACHE_KEY_SCUOLE_SELEZIONATE = '@cache_scuole_selezionate';

const toMarker = (scuola: any): MapMarker => ({
  id: scuola.name,
  position: scuola.position,
  title: scuola.name,
  icon: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  size: [25, 41],
  iconAnchor: [12, 41],
});

export default function MappeScreen() {
  const insets = useSafeAreaInsets();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [selectedScuola, setSelectedScuola] = useState<any | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const [listaScuole, setListaScuole] = useState<any[]>([]);
  const { lat, lng, zoom } = useLocalSearchParams<{ lat?: string; lng?: string; zoom?: string }>();
  const [listaScuoleSelezionate, setListaScuoleSelezionate] = useState<any[]>([]);

  // STATO PER TRACCIARE SE LA TASTIERA È APERTA
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [mapCenter, setMapCenter] = useState<LatLng>(
    lat && lng 
      ? { lat: parseFloat(lat), lng: parseFloat(lng) }
      : DEFAULT_LOCATION
  );

  // 1. CARICAMENTO DELLA CACHE ALL'AVVIO
  useEffect(() => {
    const loadCache = async () => {
      try {
        const savedData = await AsyncStorage.getItem(CACHE_KEY_SCUOLE_SELEZIONATE);
        if (savedData !== null) {
          setListaScuoleSelezionate(JSON.parse(savedData));
        }
      } catch (error) {
        console.error("Errore nel caricamento della cache delle scuole:", error);
      }
    };

    loadCache();
  }, []);

  // 2. SALVATAGGIO IN CACHE AUTOMATICO AL CAMBIAMENTO DELLO STATO
  useEffect(() => {
    const saveCache = async () => {
      try {
        await AsyncStorage.setItem(CACHE_KEY_SCUOLE_SELEZIONATE, JSON.stringify(listaScuoleSelezionate));
      } catch (error) {
        console.error("Errore nel salvataggio della cache delle scuole:", error);
      }
    };

    if (listaScuoleSelezionate.length > 0) {
      saveCache();
    }
  }, [listaScuoleSelezionate]);

  // 3. RECUPERO DATI API E GESTIONE TASTIERA
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    if (lat && lng) {
      setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
    
    api.get("/acquire/scuolePosizione?provincia=XX")
      .then(res => {
        const scuole = res.data.map((s: any) => ({
          id: s.denominazione_sede_direttivo,   
          name: s.denominazione_sede_direttivo,
          position: {
            lat: parseFloat(s.coory),
            lng: parseFloat(s.coorx)
          },
          courses: s.indirizzi || [] // Mappatura preventiva per evitare crash sugli indirizzi
        }));
        setListaScuole(scuole);
      })
      .catch(err => {
        console.log("Status:", err.response?.status);
        console.log("Detail:", err.response?.data);
        console.log("URL:", err.config?.url);
      });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [lat, lng]);

  const allMarkers = useMemo(() => listaScuole.map(toMarker), [listaScuole]);
  
  // 4. SELEZIONE SCUOLA E GESTIONE CRONOLOGIA (MAX 5 ELEMENTI)
  const selectScuola = (scuola: any) => {
    setMapCenter({ lat: scuola.position.lat, lng: scuola.position.lng });
    setSelectedScuola(scuola);
    
    setListaScuoleSelezionate((prevScuole) => {
      // Rimuove la scuola se già presente per portarla in cima alla lista
      const listaFiltrata = prevScuole.filter(s => s.id !== scuola.id);
      // Aggiunge la nuova scuola in testa e mantiene solo le ultime 5 cercate
      return [scuola, ...listaFiltrata].slice(0, 5);
    });

    setSuggestions([]);
    cardAnim.setValue(0);
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 10 }).start();
  };

  const handleMapMessage = (message: WebviewLeafletMessage) => {
    const id = message.payload?.mapMarkerID;
    if (message.event === WebViewLeafletEvents.ON_MAP_MARKER_CLICKED && id) {
      const scuola = listaScuole.find(s => s.name === id);
      if (scuola) selectScuola(scuola);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) { handleClear(); return; }
    const results = listaScuole.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    setSuggestions(results);
    setFilteredMarkers(results.map(toMarker));
  };

  const handleClear = () => {
    setFilteredMarkers(allMarkers);
    setSuggestions([]);
    setMapCenter(DEFAULT_LOCATION);
    setSelectedScuola(null);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>

      {/* Searchbar + Suggerimenti + Tag Cronologia Cache */}
      <View className="absolute top-10 left-4 right-4 z-20">
        <SearchBar placeholder="Cerca una scuola..." onSearch={handleSearch} onClear={handleClear} />
        
        {/* OPZIONE A: Menu a tendina dei suggerimenti attivi */}
        {suggestions.length > 0 && (
          <View className="mt-1 bg-white border border-[#CCDFFD] rounded-2xl overflow-hidden shadow-md">
            <FlatList
              data={suggestions}
              keyExtractor={(item: any) => item.name}
              scrollEnabled={suggestions.length > 4}
              style={{ maxHeight: 220 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => selectScuola(item)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-3 px-4 py-3 ${index < suggestions.length - 1 ? "border-b border-[#CCDFFD]" : ""}`}
                >
                  <MaterialIcons name="place" size={18} color="#066CF4" />
                  <Text className="flex-1 text-sm font-bold text-[#1A2433]" numberOfLines={1}>{item.name}</Text>
                  <MaterialIcons name="chevron-right" size={16} color="#65758C" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* OPZIONE B: Tag delle ultime scuole cercate in cache (visibili solo se non si sta digitando) */}
        {suggestions.length === 0 && listaScuoleSelezionate.length > 0 && (
          <View className="mt-2">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              className="-mx-1"
            >
              {listaScuoleSelezionate.map((scuola: any) => (
                <TouchableOpacity
                  key={scuola.id}
                  onPress={() => selectScuola(scuola)}
                  activeOpacity={0.8}
                  className="mx-1 px-3 py-2 bg-white border border-[#CCDFFD] rounded-full shadow-sm flex-row items-center gap-1.5"
                >
                  <MaterialIcons name="history" size={14} color="#65758C" />
                  <Text className="text-xs font-bold text-[#1A2433]" numberOfLines={1}>
                    {scuola.name.length > 22 ? `${scuola.name.substring(0, 22)}...` : scuola.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Mappa */}
      <LeafletView
        mapCenterPosition={mapCenter}
        zoom={zoom ? parseInt(zoom) : 12}
        mapMarkers={filteredMarkers.length > 0 ? filteredMarkers : allMarkers}
        zoomControl={false}
        attributionControl={false}
        doDebug={false}
        onMessageReceived={handleMapMessage}
        mapLayers={[{
          attribution: '&copy; JawgMaps &copy; OpenStreetMap contributors',
          baseLayer: true,
          baseLayerName: 'MapTiler',
          url: 'https://api.maptiler.com/maps/base-v4/256/{z}/{x}/{y}@2x.png?key=uSZUpEZFzcQq5rQXoX5r',
        }]}
      />

      {/* OVERLAY INVISIBILE: Chiude la tastiera se si clicca fuori */}
      {isKeyboardVisible && (
        <Pressable 
          onPress={Keyboard.dismiss} 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15 }} 
        />
      )}

      {/* Card scuola selezionata */}
      {selectedScuola && (
        <Animated.View
          className="absolute left-4 right-4 bg-white border border-[#CCDFFD] rounded-3xl shadow-md overflow-hidden"
          style={{
            bottom: 90, zIndex: 10,
            opacity: cardAnim,
            transform: [
              { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
              { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
            ],
          }}
        >
          <View className="w-full h-28 bg-[#E6F0FE] items-center justify-center">
            <MaterialIcons name="school" size={40} color="#CCDFFD" />
          </View>

          <View className="p-4">
            <View className="flex-row items-start gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-sm font-black text-[#0B131F] leading-snug" numberOfLines={2}>{selectedScuola.name}</Text>
                <Text className="text-xs text-[#65758C] mt-0.5">{selectedScuola.position.lat.toFixed(4)}, {selectedScuola.position.lng.toFixed(4)}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedScuola(null)} activeOpacity={0.7}>
                <MaterialIcons name="close" size={20} color="#65758C" />
              </TouchableOpacity>
            </View>

            {selectedScuola.courses?.length > 0 && (
              <View className="mb-3">
                <Text className="text-xs font-black text-[#65758C] uppercase tracking-wide mb-2">Indirizzi</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                  {selectedScuola.courses.map((course: string, i: number) => (
                    <View key={i} className="mx-1 px-3 py-1.5 bg-[#E6F0FE] rounded-full border border-[#CCDFFD]">
                      <Text className="text-xs font-bold text-[#066CF4]">{course}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: "/(protected)/(tabs)/scuole", params: { id: selectedScuola.id } })}
              className="bg-[#066CF4] rounded-2xl h-12 flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
              <Text className="text-white text-sm font-black">Vai alla scuola</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}