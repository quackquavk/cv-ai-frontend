"use client";
import { useState } from "react";
import { CreditCard, Shield, Globe, Zap } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { TrustIndicators } from "./TrustIndicators";
import { PricingCard } from "./PricingCard";
import { premiumFeatures, lifetimeFeatures, freeFeatures } from "../constants";
import { SubscriptionData } from "../hooks/useSubscription";

interface StripePaymentProps {
  subscriptionData?: SubscriptionData | null;
}

export const StripePayment = ({ subscriptionData }: StripePaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [lifetimeLoading, setLifetimeLoading] = useState(false);

  const handleClick = async (selectedPlan: string, selectedTier: string) => {
    const body = {
      plan_id: `${selectedPlan}`,
      tier: `${selectedTier}`,
      success_url:
        process.env.NEXT_PUBLIC_BASE_URL +
        "/user/setting/payment?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + "/user/setting/payment",
    };
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/payment/create-checkout-session",
        body
      );
      if (response.status === 200) {
        const url = response.data.checkout_url;
        window.location.href = url;
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      }
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLifetimeClick = async () => {
    const body = {
      plan_id: "lifetime",
      tier: "premium",
      success_url:
        process.env.NEXT_PUBLIC_BASE_URL +
        "/user/setting/payment?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + "/user/setting/payment",
    };
    setLifetimeLoading(true);
    try {
      const response = await axiosInstance.post(
        "/payment/create-checkout-session",
        body
      );
      if (response.status === 200) {
        const url = response.data.checkout_url;
        window.location.href = url;
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      }
      console.error("Error creating lifetime checkout session:", error);
    } finally {
      setLifetimeLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Stripe Payment
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Secure payment with credit/debit cards
          </p>
        </div>
      </div>
      {/* Trust indicators */}
      <TrustIndicators
        indicators={[
          { icon: <Shield className="h-4 w-4" />, text: "Secure Payment" },
          { icon: <Globe className="h-4 w-4" />, text: "Global Coverage" },
          { icon: <Zap className="h-4 w-4" />, text: "Instant Access" },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annual Plan Card */}
        <PricingCard
          title="Premium Plan"
          price="99"
          originalPrice="149"
          period="/year"
          features={premiumFeatures}
          loading={loading}
          onButtonClick={() => handleClick("annual", "premium")}
          discountBadge="Popular"
          buttonColor="blue"
          isSubscription={true}
          isCurrentPlan={
            subscriptionData?.has_subscription &&
            subscriptionData?.plan === "annual" &&
            !subscriptionData?.is_lifetime
          }
          subscriptionStatus={subscriptionData?.status}
        />
        {/* Lifetime Plan Card */}
        <PricingCard
          title="Premium Lifetime"
          price="299"
          originalPrice="499"
          period=""
          features={lifetimeFeatures}
          isLifetime={true}
          isPopular={true}
          loading={lifetimeLoading}
          onButtonClick={handleLifetimeClick}
          limitedOffer={true}
          buttonColor="amber"
          isCurrentPlan={subscriptionData?.is_lifetime}
          subscriptionStatus={subscriptionData?.status}
        />
      </div>

      {/* Free Plan */}
      <div className="mt-8 flex justify-left">
        <div className="w-full max-w-md">
          <PricingCard
            title="Free Plan"
            price="0"
            period="/forever"
            features={freeFeatures}
            loading={false}
            onButtonClick={() => (window.location.href = "/dashboard")}
            buttonColor="blue"
            isSubscription={false}
          />
        </div>
      </div>
    </div>
  );
};
