import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("qpm_token") || null);
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("qpm_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

   const parseJsonResponse = async (res, fallbackMessage) => {
    const text = await res.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(
          `Server returned an unexpected response (status ${res.status}). Is the backend running and reachable?`
        );
      }
    }
    if (!res.ok) {
      throw new Error(data.error || fallbackMessage);
    }
    return data;
  };

  const login = async (emailOrUsername, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password })
    });
    const data = await parseJsonResponse(res, "Login failed.");
    localStorage.setItem("qpm_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (username, email, password, bio = "") => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, bio })
    });
    const data = await parseJsonResponse(res, "Signup failed.");
    localStorage.setItem("qpm_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("qpm_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
