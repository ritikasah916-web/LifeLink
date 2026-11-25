import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("lifelink_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function restore() {
      if (!token) { if (alive) { setUser(null); setLoading(false); } return; }
      try {
        const data = await api.get("/auth/me");
        if (alive) setUser(data.user);
      } catch {
        localStorage.removeItem("lifelink_token");
        if (alive) { setToken(null); setUser(null); }
      } finally {
        if (alive) setLoading(false);
      }
    }
    restore();
    return () => { alive = false; };
  }, [token]);

  useEffect(() => {
    if (token && user?.role === "donor") connectSocket(token);
    else disconnectSocket();
    return () => disconnectSocket();
  }, [token, user?.role]);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("lifelink_token");
      setToken(null); setUser(null);
    };
    window.addEventListener("lifelink:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("lifelink:unauthorized", handleUnauthorized);
  }, []);

  async function register(payload) {
    return api.post("/auth/register", payload, { auth: false });
  }
  async function login(credentials) {
    const data = await api.post("/auth/login", credentials, { auth: false });
    localStorage.setItem("lifelink_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
    return data;
  }
  function logout() {
    localStorage.removeItem("lifelink_token");
    disconnectSocket();
    setToken(null); setUser(null); setLoading(false);
  }

  const value = useMemo(() => ({
    user, token, loading, register, login, logout,
    isAuthenticated: Boolean(token && user)
  }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}