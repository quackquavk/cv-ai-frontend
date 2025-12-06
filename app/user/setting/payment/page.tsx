"use client";
import { Suspense, useContext, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Wallet, Loader2 } from "lucide-react";
import { StripePayment } from "../components/StripePayment";
import { FonePayPayment } from "../components/FonePayPayment";
import { RazorPayPayment } from "../components/RazorPayPayment";
import { useSubscription } from "../hooks/useSubscription";
import { UserContext } from "@/context/UserContext";
import { toast } from "sonner";

function PaymentPageContent() {
  const { subscriptionData, loading, refetch } = useSubscription();
  const userContext = useContext(UserContext);
  const searchParams = useSearchParams();

  // Handle Stripe payment success redirect
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      // User returned from Stripe checkout
      const refreshAfterPayment = async () => {
        try {
          // Refresh user token to get updated premium status
          if (userContext?.refreshUser) {
            await userContext.refreshUser();
          }
          // Refetch subscription data
          await refetch();
          toast.success("Payment successful! Your subscription is now active.");

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("Error refreshing after Stripe payment:", error);
        }
      };
      refreshAfterPayment();
    }
  }, [searchParams, userContext, refetch]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="p-4 md:p-6 pt-4">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select the perfect plan for your needs. Upgrade or downgrade at any
          time.
        </p>

        {!loading && subscriptionData?.has_subscription && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {subscriptionData.is_lifetime
                ? "You have lifetime access to premium features."
                : subscriptionData.status === "canceled"
                ? `Your subscription is canceled and will expire on ${formatDate(
                    subscriptionData.current_period_end
                  )}.`
                : `Your ${
                    subscriptionData.plan
                  } subscription renews on ${formatDate(
                    subscriptionData.current_period_end
                  )}.`}
            </p>
          </div>
        )}
      </div>
      <Tabs defaultValue="stripe" className="w-full ">
        <TabsList className="grid w-full grid-cols-3 gap-2 mb-8 p-2 rounded-xl bg-transparent">
          <TabsTrigger
            value="stripe"
            className="w-full flex flex-col items-center justify-center gap-1.5 py-3 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm data-[state=active]:shadow-md border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Stripe
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              International
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="fonepay"
            className="w-full flex flex-col items-center justify-center gap-1.5 py-3 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm data-[state=active]:shadow-md border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                FonePay
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Nepal
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="razorpay"
            className="w-full flex flex-col items-center justify-center gap-1.5 py-3 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm data-[state=active]:shadow-md border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                RazorPay
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              India
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe">
          <StripePayment subscriptionData={subscriptionData} />
        </TabsContent>
        <TabsContent value="fonepay">
          <FonePayPayment subscriptionData={subscriptionData} />
        </TabsContent>
        <TabsContent value="razorpay">
          <RazorPayPayment subscriptionData={subscriptionData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentPageFallback() {
  return (
    <div className="p-4 md:p-6 pt-4 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">
          Loading payment options...
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageFallback />}>
      <PaymentPageContent />
    </Suspense>
  );
}
