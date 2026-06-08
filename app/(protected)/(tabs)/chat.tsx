import api from "@/utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const NAVBAR_HEIGHT = 80;

const colors = {
  primary:      "#066CF4",
  primaryLight: "#CCDFFD",
  primaryBg:    "#F0F6FF",
  textDark:     "#0F172A",
  textMid:      "#64748B",
  cardBg:       "#FFFFFF",
  screenBg:     "#F8FAFC",
} as const;

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Ciao! Sono il tuo assistente virtuale. Chiedimi pure qualsiasi consiglio sui percorsi di studio o sui profili professionali! 🚀",
      sender: "ai",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 40);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 40);

    setIsLoading(true);

    try {
      console.log("Mando:", { inputText });
      const risposta = await api.post("/acquire/chat", { inputText });
      
      // Adatta il campo al tuo backend (reply, message, response, ecc.)
      const aiText = risposta.data ?? "Nessuna risposta ricevuta.";

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiText,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 40);
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Si è verificato un errore. Riprova tra poco.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ height: SCREEN_HEIGHT, backgroundColor: colors.screenBg }}>

      {/* HEADER */}
      <View
        className="bg-white px-5 pt-4 pb-4 border-b border-[#E2E8F0] shadow-sm rounded-b-[24px]"
        style={{
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-3.5">
            <View
              style={{ backgroundColor: colors.primaryBg, borderColor: colors.primaryLight }}
              className="w-11 h-11 rounded-full items-center justify-center border shadow-inner relative"
            >
              <MaterialCommunityIcons name="robot-outline" size={22} color={colors.primary} />
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </View>

            <View>
              <Text style={{ color: colors.textDark }} className="text-base font-black tracking-tight">
                Orientamento AI
              </Text>
              <Text style={{ color: isLoading ? colors.primary : colors.textMid }} className="text-xs font-medium">
                {isLoading ? "Sta scrivendo..." : "Risponde all'istante"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setMessages([messages[0]])}
            activeOpacity={0.6}
            className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-full items-center justify-center"
          >
            <MaterialCommunityIcons name="broom" size={18} color={colors.textMid} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MESSAGGI */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isUser = item.sender === "user";
          return (
            <View className={`flex-row my-2 px-4 ${isUser ? "justify-end" : "justify-start"}`}>
              <View
                style={{
                  backgroundColor: isUser ? colors.primary : colors.cardBg,
                  borderColor: isUser ? colors.primary : "#E2E8F0",
                }}
                className={`p-3.5 rounded-[20px] max-w-[78%] border shadow-sm ${
                  isUser ? "rounded-tr-[4px]" : "rounded-tl-[4px]"
                }`}
              >
                <Text
                  style={{ color: isUser ? "#FFFFFF" : colors.textDark }}
                  className="text-sm font-medium leading-relaxed"
                >
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          isLoading ? (
            <View className="flex-row my-2 px-4 justify-start">
              <View
                style={{ backgroundColor: colors.cardBg, borderColor: "#E2E8F0" }}
                className="p-3.5 rounded-[20px] rounded-tl-[4px] border shadow-sm flex-row items-center gap-2"
              >
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ color: colors.textMid }} className="text-sm font-medium">
                  Sto elaborando...
                </Text>
              </View>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : NAVBAR_HEIGHT + 80,
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* INPUT BAR */}
      <View
        style={{
          position: "absolute",
          bottom: keyboardHeight > 0 ? keyboardHeight : NAVBAR_HEIGHT,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          zIndex: 999,
        }}
        className="flex-row items-center border-t border-[#E2E8F0] px-4 py-3 gap-2.5 shadow-xl"
      >
        <View className="flex-1 flex-row items-center bg-slate-50 border border-[#E2E8F0] rounded-2xl px-4 h-12">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Fai una domanda all'assistente..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-sm text-[#0F172A] font-medium"
            onSubmitEditing={handleSend}
            cursorColor={colors.primary}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          style={{
            backgroundColor:
              inputText.trim() && !isLoading ? colors.primary : colors.primaryLight,
          }}
          className="w-12 h-12 rounded-2xl items-center justify-center shadow-md shadow-blue-400/20"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

    </View>
  );
}