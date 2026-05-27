// context/AuthContext.tsx
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        setIsAuthenticated(!!token);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}