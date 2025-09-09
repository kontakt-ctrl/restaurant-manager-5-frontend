import React, { useState, useEffect, useContext, createContext } from "react";
import { getMe, loginApi } from "../services/api";

type User = { id: number; username: string; role: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      getMe(token)
        .then(data => setUser({
          id: data.id,
          username: data.username,
          role: Array.isArray(data.roles) ? data.roles[0] : data.role || ""
        }))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const { access_token, user } = await loginApi(username, password);
    setToken(access_token);
    localStorage.setItem("token", access_token);
    setUser({
      id: user.id,
      username: user.username,
      role: Array.isArray(user.roles) ? user.roles[0] : user.role || ""
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
