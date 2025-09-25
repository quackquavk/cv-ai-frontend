"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosConfig";

export interface SubscriptionData {
  has_subscription: boolean;
  is_premium: boolean;
  plan: string;
  status: string;
  gateway: string;
  is_lifetime: boolean;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/subscription/summary");
      setSubscriptionData(response.data);
    } catch (err: any) {
      console.error("Error fetching subscription data:", err);
      setError(err.response?.data?.detail || "Failed to fetch subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  return {
    subscriptionData,
    loading,
    error,
    refetch: fetchSubscriptionData,
  };
};
