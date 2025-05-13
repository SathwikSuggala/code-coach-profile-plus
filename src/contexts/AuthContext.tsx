
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { apiService } from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (userName: string, password: string) => Promise<void>;
  register: (userName: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("jwt");
        if (token) {
          // Attempt to load user data to verify token is valid
          const userData = await apiService.getUserInfo();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("jwt");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userName: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ userName, password });
      
      // Fetch user data after successful login
      const userData = await apiService.getUserInfo();
      
      setUser(userData);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userName: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.register({ userName, password, name });
      
      if (response.status) {
        // Navigate to login after successful registration
        navigate("/login");
        toast.success("Registration successful! Please log in.");
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
