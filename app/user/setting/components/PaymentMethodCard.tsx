"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import { SubscriptionData } from "../hooks/useSubscription";

interface PaymentMethod {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

interface PaymentMethodResponse {
  payment_method: PaymentMethod | null;
}

interface PaymentMethodCardProps {
  subscriptionData: SubscriptionData | null;
}

export function PaymentMethodCard({ subscriptionData }: PaymentMethodCardProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const isFonePay = subscriptionData?.gateway === "FonePay";

  useEffect(() => {
    if (!isFonePay) {
      fetchPaymentMethod();
    } else {
      setLoading(false);
    }
  }, [isFonePay]);

  const fetchPaymentMethod = async () => {
    try {
      const response = await axiosInstance.get<PaymentMethodResponse>("/subscription/payment-method");
      setPaymentMethod(response.data.payment_method);
    } catch (error) {
      console.error("Error fetching payment method:", error);
      // Don't show toast - just leave payment method empty
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setRedirecting(true);
    try {
      const response = await axiosInstance.post<{ portal_url: string }>("/subscription/portal-session");
      window.location.href = response.data.portal_url;
    } catch (error: any) {
      console.error("Error creating portal session:", error);
      toast.error(error.response?.data?.detail || "Failed to open payment portal");
      setRedirecting(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-black dark:text-white">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-black dark:text-white">Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFonePay ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              FonePay - One-time payment
            </span>
          </div>
        ) : paymentMethod ? (
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-black dark:text-white capitalize">
                {paymentMethod.brand} **** {paymentMethod.last4}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No payment method on file.
          </p>
        )}
      </CardContent>
      {!isFonePay && (
        <CardFooter>
          <Button
            variant="outline"
            onClick={handleUpdatePaymentMethod}
            disabled={redirecting}
            className="w-full"
          >
            {redirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Update Payment Method"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
