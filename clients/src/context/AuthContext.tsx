import React, { useState, useEffect, type ReactNode } from "react";
import { authApi } from "@/services/api";
import socketService from "@/services/socket";
import { AuthContext, type User } from "./auth.context";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          socketService.connect(userData.id);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    localStorage.setItem("token", response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    socketService.connect(response.user.id);
  };

  const register = async (username: string, password: string) => {
    const response = await authApi.register(username, password);
    localStorage.setItem("token", response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    socketService.connect(response.user.id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
