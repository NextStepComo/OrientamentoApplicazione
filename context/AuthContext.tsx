// context/AuthContext.tsx
import { createContext, ReactNode, useContext } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  // TODO: aggiungere login, logout, user, token, ecc.
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: sostituire con vera logica di autenticazione
  const isAuthenticated = true;

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}