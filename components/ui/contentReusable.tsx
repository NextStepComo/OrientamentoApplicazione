// components/ui/contentReusable.tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";

export const colors = {
  primary:      "#066CF4",
  primaryLight: "#CCDFFD",
  primaryBg:    "#E6F0FE",
  textDark:     "#0B131F",
  textMid:      "#65758C",
  textSub:      "#556070",
  textBody:     "#334155",
  border:       "#CCDFFD",
  cardBg:       "#FFFFFF",
  screenBg:     "#F5F7FA",
} as const;

export type MatchItem = {
  label: string;
  pct: number;
  color: string;
  delay?: number;
};

export type AltItem = {
  emoji: string;
  name: string;
  meta: string;
  pct: number;
};

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
};

// animazioni
export function useFadeSlideIn(delay = 100, offsetY = 16) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 700,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  };
}

/** Wrapper standard per ogni sezione dello screen */
export function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: string;
  title: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mx-4 mt-5">
      <SectionTitle icon={icon} title={title} count={count} />
      {children}
    </View>
  );
}

/** Barra di match animata */
export function MatchBar({ label, pct, color, delay = 0 }: MatchItem) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 900,
      delay,
      useNativeDriver: true,
    }).start();
  }, [pct]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-100%", `${-100 + pct}%`],
  });

  return (
    <View className="flex-row items-center gap-3.5 mb-2.5">
      <Text className="w-20 text-xs font-bold text-[#4B5563]">{label}</Text>
      <View className="flex-1 h-2 bg-[#CCDFFD] rounded-full overflow-hidden relative">
        <Animated.View
          style={{
            backgroundColor: color,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            transform: [{ translateX }],
          }}
          className="rounded-full"
        />
      </View>
      <Text className="w-9 text-right text-xs font-black text-[#0B131F]">
        {pct}%
      </Text>
    </View>
  );
}

/** Card statistica Bento-style */
export function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <Card className="flex-1 items-center bg-white border border-[#CCDFFD] rounded-2xl p-3 shadow-sm">
      <MaterialIcons name={icon as any} size={20} color={colors.primary} />
      <Text className="text-lg font-black text-[#0B131F] mt-1 tracking-tight">
        {value}
      </Text>
      <Text className="text-[10px] font-bold text-[#65758C] text-center mt-0.5 uppercase tracking-wide">
        {label}
      </Text>
    </Card>
  );
}

/** Riga indirizzo alternativo */
export function AltRow({ emoji, name, meta, pct }: AltItem) {
  return (
    <Card className="flex-row items-center gap-3 p-3.5 bg-white border border-[#CCDFFD] rounded-2xl mb-2 shadow-sm">
      <Text className="text-2xl w-8 text-center">{emoji}</Text>
      <View className="flex-1 justify-center">
        <Text className="text-sm font-bold text-[#1A2433] leading-snug">
          {name}
        </Text>
        <Text className="text-xs text-[#556070] mt-0.5">{meta}</Text>
      </View>
      <Badge className="bg-[#CCDFFD] border-transparent px-2.5 py-1 rounded-full">
        <Text className="text-[#066CF4] text-xs font-black">{pct}%</Text>
      </Badge>
    </Card>
  );
}

/** Titolo di sezione standardizzato */
export function SectionTitle({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count?: string;
}) {
  return (
    <View className="flex-row items-center gap-2 mb-3 mt-1">
      <MaterialIcons name={icon as any} size={18} color={colors.primary} />
      <Text className="text-base font-black text-[#0B131F] flex-1 tracking-tight">
        {title}
      </Text>
      {count && (
        <Badge variant="outline" className="border-[#CCDFFD] bg-transparent">
          <Text className="text-xs text-[#556070] font-semibold">{count}</Text>
        </Badge>
      )}
    </View>
  );
}

/** Navigazione inferiore fissa */
export function BottomNavBar({
  items,
  activeId,
  onTabPress,
}: {
  items: NavItem[];
  activeId: string;
  onTabPress: (id: string) => void;
}) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#CCDFFD] flex-row h-20 pb-4 shadow-lg justify-around items-center">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onTabPress(item.id)}
            activeOpacity={0.7}
            className="flex-1 items-center justify-center h-full"
          >
            <View className="items-center justify-center gap-1">
              <MaterialIcons
                name={item.icon as any}
                size={22}
                color={isActive ? colors.primary : colors.textMid}
              />
              <Text
                className={`text-[11px] tracking-wide ${
                  isActive
                    ? "font-black text-[#066CF4]"
                    : "font-bold text-[#65758C]"
                }`}
              >
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}