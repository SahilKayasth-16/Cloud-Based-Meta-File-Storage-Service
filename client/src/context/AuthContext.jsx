import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem("auth_token");
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed:", error);
          sessionStorage.removeItem("auth_token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    if (response.token) {
      sessionStorage.setItem("auth_token", response.token);
      setUser(response.user);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    if (response.token) {
      sessionStorage.setItem("auth_token", response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    sessionStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
