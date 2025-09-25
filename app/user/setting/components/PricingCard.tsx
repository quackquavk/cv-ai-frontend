import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Crown, RefreshCw, Users, Loader2, CheckCircle } from "lucide-react";

interface Feature {
  text: string;
  highlight?: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string | null;
  period: string;
  features: Feature[];
  isLifetime?: boolean;
  isPopular?: boolean;
  loading?: boolean;
  onButtonClick: () => void;
  currency?: string;
  discountBadge?: string | null;
  limitedOffer?: boolean;
  paymentMethod?: string;
  buttonColor?: "blue" | "red" | "purple" | "amber";
  isSubscription?: boolean;
  isCurrentPlan?: boolean;
  subscriptionStatus?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  originalPrice = null,
  period,
  features,
  isLifetime = false,
  isPopular = false,
  loading = false,
  onButtonClick,
  currency = "$",
  discountBadge = null,
  limitedOffer = false,
  paymentMethod = "",
  buttonColor = "blue",
  isSubscription = false,
  isCurrentPlan = false,
  subscriptionStatus = "",
}) => {
  // Button color classes based on the prop
  const buttonClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-[#ce2027] hover:bg-[#a61a20]",
    purple: "bg-purple-600 hover:bg-purple-700",
    amber:
      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
  };

  return (
    <Card
      className={`flex flex-col gap-5 p-6 ${
        isPopular
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg"
          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg"
      } transition-all duration-300 relative overflow-hidden`}
    >
      {/* Discount Badge */}
      {discountBadge && (
        <div
          className={`absolute top-0 right-0 ${
            isPopular
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : buttonColor === "red"
              ? "bg-[#ce2027]"
              : buttonColor === "purple"
              ? "bg-purple-600"
              : "bg-blue-600"
          } text-white text-xs font-bold px-3 py-1 rounded-bl-lg`}
        >
          {discountBadge}
        </div>
      )}
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Star className="h-3 w-3" />
          BEST VALUE
        </div>
      )}
      {/* Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPopular && (
            <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          )}
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-black dark:text-white">
              {currency}
              {price}
            </p>
            {originalPrice && (
              <p className="text-xl font-medium text-gray-500 dark:text-gray-400 line-through">
                {currency}
                {originalPrice}
              </p>
            )}
          </div>
        </div>
        <span className="text-gray-600 dark:text-gray-400">{period}</span>
      </div>
      {/* Title */}
      <p
        className={`text-lg ${
          isPopular ? "font-bold" : "font-semibold"
        } text-black dark:text-white`}
      >
        {title}
      </p>
      {/* Features */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isLifetime
            ? "Everything in Premium, forever:"
            : "Everything you need to grow:"}
        </p>
        <ul className="space-y-1.5">
          {features.map((feature, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 text-sm ${
                feature.highlight
                  ? "font-semibold text-amber-700 dark:text-amber-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Check
                className={`h-4 w-4 ${
                  feature.highlight ? "text-amber-500" : "text-green-500"
                }`}
              />
              {feature.text}
            </li>
          ))}
        </ul>
      </div>
      {/* Subscription Info */}
      {isSubscription && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Recurring subscription. Cancel anytime.
          </p>
        </div>
      )}
      {/* Limited Offer */}
      {limitedOffer && (
        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-1">
            <Users className="h-4 w-4" />
            Limited to first 100 users only!
          </p>
        </div>
      )}
      {/* CTA Button */}
      <div className="mt-auto">
        <Button
          onClick={onButtonClick}
          disabled={loading || isCurrentPlan}
          className={`w-full ${
            isCurrentPlan 
              ? "bg-green-600 hover:bg-green-600" 
              : isPopular ? buttonClasses.amber : buttonClasses[buttonColor]
          } text-white font-medium py-2.5 transition-all duration-300 ${
            isPopular ? "shadow-md hover:shadow-lg" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {subscriptionStatus === "canceled" ? "Current Plan (Expires Soon)" : "Current Plan"}
            </>
          ) : isLifetime ? (
            "Get Lifetime Access"
          ) : isSubscription ? (
            `Subscribe to ${title}`
          ) : (
            `Choose ${title}`
          )}
        </Button>
        <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">
          {isLifetime
            ? "One-time payment. Lifetime access."
            : isSubscription
            && "Recurring payment. Cancel anytime."}
        </p>
      </div>
    </Card>
  );
};
