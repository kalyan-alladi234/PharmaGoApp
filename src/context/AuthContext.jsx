import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // initialize from localStorage so useAuth consumers see the logged-in user
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("user"));
      if (saved) setUser(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  const login = (username, password) => {
    // Simple mock login (replace with Firebase/Auth later if needed)
    if (username && password) {
      setUser({ username });
    }
  };

  const signup = (username, password) => {
    // Simple mock signup
    if (username && password) {
      setUser({ username });
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
