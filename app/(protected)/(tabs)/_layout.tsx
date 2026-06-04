// app/(protected)/(tabs)/_layout.tsx
import { BottomNavBar, NavItem } from "@/components/ui/contentReusable";
import "@/global.css";
import { router, Slot, usePathname } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_ITEMS: NavItem[] = [
  {
    id: "contenuti",
    label: "Home",
    icon: "home",
    path: "/(protected)/(tabs)/contenuti",
  },
  {
    id: "scuole",
    label: "Scuole",
    icon: "school",
    path: "/(protected)/(tabs)/scuole",       
  },
  {
    id: "chat",
    label: "NextStep Bot",
    icon: "robot",
    path: "/(protected)/(tabs)/chat",       
  },
  {
    id: "mappe",
    label: "Mappe",
    icon: "map",
    path: "/(protected)/(tabs)/mappe",
  },
  {
    id: "profilo",
    label: "Profilo",
    icon: "account",
    path: "/(protected)/(tabs)/profilo",  
  },
];

export default function TabsLayout() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const activeId = NAV_ITEMS.find((item) => pathname.includes(item.id))?.id ?? "home";

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      {/* Schermata attiva renderizzata qui da Expo Router */}
      <Slot />

      <BottomNavBar
        items={NAV_ITEMS}
        activeId={activeId}
        onTabPress={(id) => {
          const target = NAV_ITEMS.find((item) => item.id === id);
          if (target) router.push(target.path as any);
        }}
      />
    </View>
  );
}