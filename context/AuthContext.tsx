// context/AuthContext.tsx
import { User } from "@/types/user";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async (token: string) => {
    const responseMe = await axios.get<User>("http://10.0.1.51:8000/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(responseMe.data);
    setIsAuthenticated(true);
  };

  const login = async (token: string) => {
    await SecureStore.setItemAsync("token", token);
    await fetchUser(token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (token) await fetchUser(token);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}