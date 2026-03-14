"use client";

import api from "@/lib/api";
import { Usuario } from "@/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null;
  isLoading: boolean;
  loginContext: (token: string | null, userData: Usuario) => void;
  logoutContext: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      const userInfo = localStorage.getItem("user_info");

      if (token && userInfo) {
        const userData: Usuario = JSON.parse(userInfo);

       // api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erro ao ler o localStorage:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginContext = (token: string | null, userData: Usuario) => {
    if (token) {
      localStorage.setItem("auth_token", token);
      // api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    localStorage.setItem("user_info", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);

    router.refresh();
  };

  const logoutContext = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    delete api.defaults.headers.common["Authorization"];

    setUser(null);
    setIsAuthenticated(false);

    router.push("/login");
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    loginContext,
    logoutContext,
  };

  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
