import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

// Get API URL dynamically - use relative paths or environment variable
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default to current hostname on port 8000
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8000`;
};

// Centralized error handling for auth requests
function handleAuthError(err) {
  const message = err?.message || "Authentication failed. Please try again.";
  if (message === "Failed to fetch" || message?.includes("AbortError")) {
    return "Unable to reach backend server. Please make sure it is running.";
  }
  if (message?.toLowerCase().includes("email already")) {
    return "Email already registered or validation error.";
  }
  if (message?.toLowerCase().includes("invalid credentials")) {
    return "Invalid email or password.";
  }
  if (message?.toLowerCase().includes("password")) {
    return message;
  }
  return message;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const API_URL = getApiUrl();

  useEffect(() => {
    if (token) {
      const storedId = localStorage.getItem("user_id");
      if (storedId) {
        fetchProfile(storedId, token);
      }
    }
  }, [token]);

  async function fetchProfile(id, authToken) {
    try {
      const url = `${API_URL}/api/users/${id}`;
      console.debug("Fetching user profile from", url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Accept": "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.error(`Failed to fetch profile: ${res.status} ${res.statusText}`);
        if (res.status === 401) {
          // Token invalid, clear it
          logout();
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.error("Profile fetch timeout");
      } else {
        console.error("Error fetching profile:", e);
      }
    }
  }

  async function login(email, password) {
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      
      const url = `${API_URL}/api/users/login`;
      console.debug("Logging in user to", url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch(url, { 
        method: "POST", 
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: form,
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const responseText = await res.text();
      let responseData = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.debug("Login response was not valid JSON", responseText);
      }
      console.debug("Login response status", res.status, res.statusText, responseData || responseText);
      
      if (!res.ok) {
        const message = responseData?.detail || responseData?.message || responseText || `Login failed: ${res.status} ${res.statusText}`;
        throw new Error(message);
      }
      
      const data = responseData || (responseText ? JSON.parse(responseText) : {});
      const token = data.access_token;
      const userId = data.user_id;
      setToken(token);
      localStorage.setItem("auth_token", token);
      if (userId) localStorage.setItem("user_id", String(userId));
      if (userId) await fetchProfile(userId, token);
      return token;
    } catch (error) {
      console.error("Login error:", error);
      const message = handleAuthError(error);
      const err = new Error(message);
      throw err;
    }
  }

  function logout() {
    if (user && user.id) {
      const url = `${API_URL}/api/users/activity`;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, action: "logout" }),
        credentials: "include"
      }).catch((e) => console.error("Logout activity error:", e));
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
  }

  async function logActivity(action, details) {
    if (!user || !user.id) return;
    try {
      const url = `${API_URL}/api/users/activity`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, action, details }),
        credentials: "include"
      });
    } catch (e) {
      console.error("Activity log error:", e);
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, login, logout, fetchProfile, logActivity }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
