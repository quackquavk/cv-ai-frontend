"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription, SubscriptionData } from "../hooks/useSubscription";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";
import { InvoiceHistoryCard } from "./InvoiceHistoryCard";
import { PaymentMethodCard } from "./PaymentMethodCard";

export function BillingOverview() {
  const { subscriptionData, loading, refetch } = useSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "past_due":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getGatewayBadgeClass = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case "stripe":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "fonepay":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "razorpay":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600 dark:text-gray-400">Loading billing information...</div>;
  }

  if (!subscriptionData?.has_subscription) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">No active subscription.</p>
      </div>
    );
  }

  const data = subscriptionData;
  const isLifetime = data.is_lifetime;
  const isFonePay = data.gateway === "FonePay";
  const isCanceling = data.cancel_at_period_end;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Current Plan */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-black dark:text-white">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-black dark:text-white capitalize">
                {data.plan} Plan
              </span>
              <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeClass(data.status)}`}>
                {isLifetime ? "Lifetime" : data.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${getGatewayBadgeClass(data.gateway)}`}>
                {data.gateway}
              </span>
              {isCanceling && (
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Canceling
                </span>
              )}
            </div>
            {isLifetime ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You have lifetime access to premium features.
              </p>
            ) : data.current_period_end ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCanceling
                  ? `Access until ${new Date(data.current_period_end).toLocaleDateString()}`
                  : `Renews on ${new Date(data.current_period_end).toLocaleDateString()}`}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex-col gap-2 items-stretch">
            {!isLifetime && !isFonePay && (
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
              >
                Cancel Subscription
              </Button>
            )}
            {isFonePay && (
              <div className="text-xs text-green-700 dark:text-green-400 font-medium">
                One-time purchase
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Card 2: Invoice History */}
        <InvoiceHistoryCard />

        {/* Card 3: Payment Method */}
        <PaymentMethodCard subscriptionData={subscriptionData} />
      </div>

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={refetch}
        subscriptionData={subscriptionData}
      />
    </>
  );
}
