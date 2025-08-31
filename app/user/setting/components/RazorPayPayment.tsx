"use client";
import { useState } from "react";
import { Wallet, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { TrustIndicators } from "./TrustIndicators";
import { PricingCard } from "./PricingCard";
import { premiumFeatures, lifetimeFeatures, freeFeatures } from "../constants";
import { RazorpayService, PlanType } from "@/utils/razorpay";

export const RazorPayPayment = () => {
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const razorpayService = new RazorpayService();

  const handleSubscribe = async (plan: PlanType) => {
    setLoadingPlan(plan);

    // Use subscription method for annual plan
    if (plan === "annual") {
      await razorpayService.initiateSubscription({
        plan,
        onSuccess: () => {
          toast.success("Subscription activated successfully!");
          setLoadingPlan(null);
        },
        onError: (err: any) => {
          const message = err?.message || "Subscription failed";
          toast.error(err.response?.data?.detail || message);
          setLoadingPlan(null);
        },
      });
    } else {
      // Use regular payment method for lifetime plan
      await razorpayService.initiatePayment({
        plan,
        onSuccess: () => {
          toast.success("Payment successful!");
          setLoadingPlan(null);
        },
        onError: (err: any) => {
          const message = err?.message || "Payment failed";
          toast.error(err.response?.data?.detail || message);
          setLoadingPlan(null);
        },
      });
    }
  };

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            RazorPay Payment
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pay with UPI, cards, wallets & more
          </p>
        </div>
      </div>
      {/* Trust indicators */}
      <TrustIndicators
        indicators={[
          { icon: <Shield className="h-4 w-4" />, text: "Secure Payment" },
          { icon: <Zap className="h-4 w-4" />, text: "Instant Access" },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PricingCard
          title="Annual Plan"
          price="7000.00"
          period="/year"
          currency="INR "
          features={premiumFeatures}
          loading={loadingPlan === "annual"}
          onButtonClick={() => handleSubscribe("annual")}
          discountBadge="Popular"
          buttonColor="purple"
          isSubscription={true}
        />
        <PricingCard
          title="Lifetime Deal"
          price="9999.00"
          period=""
          currency="INR "
          features={lifetimeFeatures}
          isLifetime={true}
          isPopular={true}
          loading={loadingPlan === "lifetime"}
          onButtonClick={() => handleSubscribe("lifetime")}
          limitedOffer={true}
          buttonColor="amber"
        />
      </div>

      {/* Free Plan */}
      <div className="mt-8 flex justify-left">
        <div className="w-full max-w-md">
          <PricingCard
            title="Free Plan"
            price="0"
            period="/forever"
            currency="INR "
            features={freeFeatures}
            loading={false}
            onButtonClick={() => (window.location.href = "/dashboard")}
            buttonColor="purple"
            isSubscription={false}
          />
        </div>
      </div>
    </div>
  );
};
