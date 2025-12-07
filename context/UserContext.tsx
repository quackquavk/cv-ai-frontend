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

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/user/me");
      setUser(response.data);
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false);
      localStorage.setItem("isAuthenticated", "false");
      window.dispatchEvent(new Event("local-storage"));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      await axiosInstance.get("/user/refresh", { withCredentials: true });
      await fetchUser();
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, [fetchUser]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.setItem("isAuthenticated", "false");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("local-storage"));
  }, []);

  useEffect(() => {
    fetchUser();
  }, [isAuthenticated, fetchUser]);

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
