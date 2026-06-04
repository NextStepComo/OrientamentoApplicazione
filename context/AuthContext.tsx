// context/AuthContext.tsx
import { User } from "@/types/user";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => ({} as User),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const fetchUser = async (token: string) => {
    const responseMe = await api.get<User>("/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(responseMe.data);
    setToken(token);
    setIsAuthenticated(true);
  };

  const login = async (token: string, refreshToken: string): Promise<User> => {
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("refresh_token", refreshToken);
    const responseMe = await api.get<User>("/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(responseMe.data);
    setToken(token);
    setIsAuthenticated(true);
    return responseMe.data; // ← ritorna i dati freschi
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("refresh_token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        if (storedToken) await fetchUser(storedToken);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    };
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}