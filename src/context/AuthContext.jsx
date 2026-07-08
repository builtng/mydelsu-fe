"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch, getCsrfCookie } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

function getCookie(name) {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const res = await apiFetch("/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem("mydelsu_user", JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem("mydelsu_user");
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial load checks localStorage first to avoid flash of unauthenticated state
    const localUser = localStorage.getItem("mydelsu_user");
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch {
        // invalid JSON
      }
    }
    
    // Validate with backend API
    const checkAuth = async () => {
      await refreshProfile();
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    // 1. Get CSRF cookie first for stateful sessions
    await getCsrfCookie();
    const csrfToken = getCookie("XSRF-TOKEN");

    // 2. Perform Sanctum/Fortify login
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/login`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Invalid credentials.");
    }

    // 3. Fetch user profile and save token if returned (supporting both SPA cookies and tokens)
    await refreshProfile();
  };

  const register = async (name, email, password, confirmPassword) => {
    await getCsrfCookie();
    const csrfToken = getCookie("XSRF-TOKEN");

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/register`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Registration failed.");
    }

    await refreshProfile();
  };

  const logout = async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("mydelsu_token");
    localStorage.removeItem("mydelsu_user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
