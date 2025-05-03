"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { IUserType } from "@/interfaces/UserType";
import axiosInstance from "@/utils/axiosConfig";

interface UserContextType {
  user: IUserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextType | null>({
  user: null,
  loading: false,
  isAuthenticated: false,
  setIsAuthenticated: () => {},
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/user/me");
        setUser(response.data);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        window.dispatchEvent(new Event("local-storage")); // Dispatch a custom event
        setLoading(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
        localStorage.setItem("isAuthenticated", "false");
        window.dispatchEvent(new Event("local-storage")); // Dispatch a custom event
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  return (
    <UserContext.Provider
      value={{ user, loading, isAuthenticated, setIsAuthenticated }}
    >
      {children}
    </UserContext.Provider>
  );
};
