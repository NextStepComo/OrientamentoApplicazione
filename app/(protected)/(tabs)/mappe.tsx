// app/(protected)/(tabs)/mappe.tsx
import { SearchBar } from "@/components/ui/contentReusable";
import { Text } from "@/components/ui/text";
import api from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { LatLng, LeafletView, MapMarker, WebViewLeafletEvents, WebviewLeafletMessage } from 'react-native-leaflet-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_LOCATION: LatLng = { lat: 45.4741, lng: 9.1892 };

const toMarker = (scuola: any): MapMarker => ({
  id: scuola.id,
  position: scuola.position,
  title: scuola.name,
  icon: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  size: [25, 41],
  iconAnchor: [12, 41],
});

export default function MappeScreen() {
  const insets = useSafeAreaInsets();
  const [mapCenter, setMapCenter] = useState<LatLng>(DEFAULT_LOCATION);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [selectedScuola, setSelectedScuola] = useState<any | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const [listaScuole, setListaScuole] = useState<any[]>([]);
  
  useEffect(() => {
    api.get("/acquire/scuolePosizione?provincia=MI")
    .then(res => {
      const scuole = res.data.map((s: any) => ({
        name: s.denominazione_sede_direttivo,
        position: {
          lat: parseFloat(s.coory),
          lng: parseFloat(s.coorx)
        }
      }));
      setListaScuole(scuole);
    })
      .catch(err => {
        console.log("Status:", err.response?.status);
        console.log("Detail:", err.response?.data);
        console.log("URL:", err.config?.url);
      });
  }, []);

  const allMarkers: MapMarker[] = useMemo(() => listaScuole.map(toMarker), []);


  
  const selectScuola = (scuola: any) => {
    setMapCenter({ lat: scuola.position.lat, lng: scuola.position.lng });
    setSelectedScuola(scuola);
    setSuggestions([]);
    cardAnim.setValue(0);
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 10 }).start();
  };

  const handleMapMessage = (message: WebviewLeafletMessage) => {
    const id = message.payload?.mapMarkerID;
    if (message.event === WebViewLeafletEvents.ON_MAP_MARKER_CLICKED && id) {
      const scuola = listaScuole.find(s => s.id === id);
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

      {/* Searchbar + suggerimenti */}
      <View className="absolute top-10 left-4 right-4 z-10">
        <SearchBar placeholder="Cerca una scuola..." onSearch={handleSearch} onClear={handleClear} />
        {suggestions.length > 0 && (
          <View className="mt-1 bg-white border border-[#CCDFFD] rounded-2xl overflow-hidden shadow-md">
            <FlatList
              data={suggestions}
              keyExtractor={(item: any) => item.id}
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
      </View>

      {/* Mappa */}
      <LeafletView
        mapCenterPosition={mapCenter}
        zoom={12}
        mapMarkers={filteredMarkers.length > 0 ? filteredMarkers : allMarkers}
        zoomControl={false}
        attributionControl={false}
        onMessageReceived={handleMapMessage}
        mapLayers={[{
          attribution: '&copy; JawgMaps &copy; OpenStreetMap contributors',
          baseLayer: true,
          baseLayerName: 'MapTiler',
          url: 'https://api.maptiler.com/maps/base-v4/256/{z}/{x}/{y}@2x.png?key=uSZUpEZFzcQq5rQXoX5r',
        }]}
      />

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