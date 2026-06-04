import { SearchBar } from "@/components/ui/contentReusable";
import listaScuole from "@/constants/listaScuole.json";
import { useState } from "react";
import { View } from "react-native";
import { AnimationType, LeafletView, MapMarker, MapMarkerAnimation } from 'react-native-leaflet-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_LOCATION = { lat: 45.4741, lng: 9.1892 }; // Milano
export default function MappeScreen() {
  const insets = useSafeAreaInsets();

  const animazione: MapMarkerAnimation = {
    type: AnimationType.WAGGLE,
    duration: 2,
    iterationCount: 1
  };
    
  const markers: MapMarker[] = Object.values(listaScuole).map((scuola: any) => ({
    //animation: animazione, 
    id: scuola.id,
    position: scuola.position,
    title: scuola.name,
    icon: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // marker classico Leaflet
    size: [25, 41],
    iconAnchor: [12, 41], // X: metà larghezza, Y: altezza intera = punta in basso
  }));

  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>(markers);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredMarkers(markers);
      return;
    }
    const lower = query.toLowerCase();
    setFilteredMarkers(
        markers.filter((m) => m.title?.toLowerCase().includes(lower))
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
  
        {/* Searchbar flottante */}
        <View className="absolute top-10 left-4 right-4 z-10">
            <SearchBar
            placeholder="Cerca una scuola..."
            onSearch={handleSearch}
            />
        </View>

            <LeafletView
                mapCenterPosition={DEFAULT_LOCATION}
                zoom={8}
                mapMarkers={markers}
                zoomControl = {false}
                mapLayers={[
                    {
                    attribution: '&copy; JawgMaps &copy; OpenStreetMap contributors',
                    baseLayer: true,
                    baseLayerName: 'Jawg Lagoon',
                    url: 'https://api.maptiler.com/maps/base-v4/256/{z}/{x}/{y}@2x.png?key=uSZUpEZFzcQq5rQXoX5r',
                    }
                ]}
            />
    </View>

  );
}

<SearchBar
  placeholder="Cerca una scuola..."
  onSearch={(query) => console.log(query)}
/>