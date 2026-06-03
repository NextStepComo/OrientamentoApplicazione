// constants/theme.ts
import { Platform } from "react-native";

export const C = {
  nsBlue: "#066CF4",
  nsBlueBright: "#2F7DF6",
  nsBlueGlow: "#5B9CFF",
  nsBluePale: "#DCE8FF",
  nsBlue50: "#F0F5FF",
  nsInk: "#0B1220",
  nsDark: "#1F2937",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",
  line: "rgba(15,23,42,0.08)",
  lineStrong: "rgba(15,23,42,0.14)",
  textSoft: "#475569",
  textMute: "#94A3B8",
  green: "#10B981",
  greenSoft: "#ECFDF5",
  warm: "#F59E0B",
  warmSoft: "#FEF3C7",
  purple: "#8B5CF6",
  purpleSoft: "#F3E8FF",
  pink: "#EC4899",
  pinkSoft: "#FCE7F3",
};

export const S_GLOBAL = {
  radiusCard: 20,
  radiusButton: 999,
  paddingCanvas: 24,
  shadow: {
    shadowColor: "#0F1729",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  }
};

export const FONT = {
  condensed: Platform.select({ ios: "System", android: "sans-serif-condensed" }),
};