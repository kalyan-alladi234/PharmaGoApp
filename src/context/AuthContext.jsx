import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

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
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
