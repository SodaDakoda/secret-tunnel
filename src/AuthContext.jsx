import { createContext, useContext, useState, useEffect } from "react";

const API = "https://fsa-jwt-practice.herokuapp.com";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState("GATE");
  const [error, setError] = useState(null);

  async function signup(username) {
    try {
      setError(null);

      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) throw new Error("Signup failed — name may be invalid.");

      const data = await res.json();

      setToken(data.token);
      setLocation("TABLET");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function authenticate() {
    try {
      setError(null);

      if (!token) throw new Error("No token found — please sign up again.");

      const res = await fetch(`${API}/authenticate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok)
        throw new Error("Authentication failed — token may be malformed.");

      await res.json();
      setLocation("TUNNEL");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("token");
    if (saved) {
      setToken(saved);
      setLocation("TABLET");
    }
  }, []);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
    }
  }, [token]);

  const value = {
    token,
    location,
    signup,
    authenticate,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
