import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { apiService } from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  role: string | null;
  login: (userName: string, password: string) => Promise<void>;
  register: (userName: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  role: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("jwt");
        const storedRole = localStorage.getItem("role");
        
        if (token) {
          // Attempt to load user data to verify token is valid
          const userData = await apiService.getUserInfo();
          setUser(userData);
          setRole(storedRole);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("jwt");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
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
      
      // Store the JWT token
      localStorage.setItem("jwt", response.jwt);
      localStorage.setItem("role", response.role);
      
      // Fetch user data after successful login
      const userData = await apiService.getUserInfo();
      
      // Update all state at once
      setUser(userData);
      setRole(response.role);
      setIsAuthenticated(true);
      
      // Navigate after state updates
      if (response.role === "ROLE_ADMIN") {
        navigate("/admin-home", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      // Clear any partial state on error
      localStorage.removeItem("jwt");
      localStorage.removeItem("role");
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
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
    try {
      // Clear all state first
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      
      // Clear localStorage
      localStorage.removeItem("jwt");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      
      // Navigate to login page with replace
      navigate("/login", { replace: true });
      
      // Show success message
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        role,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
