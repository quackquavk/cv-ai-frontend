"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { IUserType } from "@/interfaces/UserType";
import axiosInstance from "@/utils/axiosConfig";

interface UserContextType {
  user: IUserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | null>({
  user: null,
  loading: false,
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  refreshUser: async () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from localStorage and listen for changes
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }

    // Listen for localStorage changes (including from other components)
    const handleStorageChange = () => {
      const currentAuth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(currentAuth === "true");
    };

    window.addEventListener("local-storage", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("local-storage", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/user/me");
      setUser(response.data);
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.setItem("isAuthenticated", "false");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.setItem("isAuthenticated", "false");
    window.dispatchEvent(new Event("local-storage"));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      await axiosInstance.get("/user/refresh", { withCredentials: true });
      await fetchUser();
    } catch (error) {
      console.error("Error refreshing user:", error);
      logout();
    }
  }, [fetchUser, logout]);

  // Fetch user when isAuthenticated becomes true
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    } else if (!isAuthenticated) {
      setUser(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchUser, user]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        setIsAuthenticated,
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
