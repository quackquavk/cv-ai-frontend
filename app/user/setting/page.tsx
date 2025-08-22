
"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import {
  Menu,
  X,
  Loader2,
  BadgeCheck,
  CreditCard,
  Smartphone,
  Wallet,
  Crown,
  ArrowLeft,
  Check,
  Star,
  Shield,
  Zap,
  Users,
  Globe,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { RazorpayService, PlanType } from "@/utils/razorpay";
// Reusable TrustIndicators component
const TrustIndicators = ({ indicators }) => (
  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
    {indicators.map((indicator, index) => (
      <div key={index} className="flex items-center gap-1">
        {indicator.icon}
        <span>{indicator.text}</span>
      </div>
    ))}
  </div>
);
// Reusable PricingCard component
const PricingCard = ({
  title,
  price,
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
          <p className="text-3xl font-bold text-black dark:text-white">
            {currency}
            {price}
          </p>
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
          disabled={loading}
          className={`w-full ${
            isPopular ? buttonClasses.amber : buttonClasses[buttonColor]
          } text-white font-medium py-2.5 transition-all duration-300 ${
            isPopular ? "shadow-md hover:shadow-lg" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
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
            ? "Recurring payment. Cancel anytime."
            : "Cancel anytime. 30-day money-back guarantee."}
        </p>
      </div>
    </Card>
  );
};
// Define the premium features once to use across all payment methods
const premiumFeatures = [
  { text: "Private Folder" },
  { text: "Unlimited CV uploads" },
  { text: "Access to linkedin bots" },
  { text: "Priority support" },
];
const lifetimeFeatures = [
  ...premiumFeatures,
  { text: "All future updates", highlight: true },
];
const StripePayment = () => {
  const [loading, setLoading] = useState(false);
  const [lifetimeLoading, setLifetimeLoading] = useState(false);
  const handleClick = async (selectedPlan, selectedTier) => {
    const body = {
      plan_id: `${selectedPlan}`,
      tier: `${selectedTier}`,
      success_url: process.env.NEXT_PUBLIC_BASE_URL + "/user/setting",
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + "/user/setting",
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
    } catch (error) {
      if (error.response.status === 400) {
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
      success_url: process.env.NEXT_PUBLIC_BASE_URL + "/user/setting",
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + "/user/setting",
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
    } catch (error) {
      if (error.response.status === 400) {
        toast.error(error.response.data.detail);
      }
      console.error("Error creating lifetime checkout session:", error);
    } finally {
      setLifetimeLoading(false);
    }
  };
  return (
    <div className="space-y-8">
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
          price="100.00"
          period="/year"
          features={premiumFeatures}
          loading={loading}
          onButtonClick={() => handleClick("annual", "premium")}
          discountBadge="Popular"
          buttonColor="blue"
          isSubscription={true}
        />
        {/* Lifetime Plan Card */}
        <PricingCard
          title="Premium Lifetime"
          price="99.00"
          period=""
          features={lifetimeFeatures}
          isLifetime={true}
          isPopular={true}
          loading={lifetimeLoading}
          onButtonClick={handleLifetimeClick}
          limitedOffer={true}
          buttonColor="amber"
        />
      </div>
    </div>
  );
};
const FonePayPayment = () => {
  const [loading, setLoading] = useState(false);
  const [lifetimeLoading, setLifetimeLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [planStatus, setPlanStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const webSocketRef = useRef(null);
  const handleClick = async (selectedPlan, planStatus) => {
    const body = {
      plan_id: `${selectedPlan}`,
    };
    setPlanStatus(planStatus);
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/fonepay/create-checkout-session",
        body
      );
      if (response.status === 200) {
        setQrValue(response?.data?.qr_message);
        setOpen(true);
        connectToWebSocket(response?.data?.payment_id);
      }
    } catch (error) {
      if (error.response.status === 400) {
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
    };
    setPlanStatus("Lifetime");
    setLifetimeLoading(true);
    try {
      const response = await axiosInstance.post(
        "/fonepay/create-checkout-session",
        body
      );
      if (response.status === 200) {
        setQrValue(response?.data?.qr_message);
        setOpen(true);
        connectToWebSocket(response?.data?.payment_id);
      }
    } catch (error) {
      if (error.response.status === 400) {
        toast.error(error.response.data.detail);
      }
      console.error("Error creating lifetime checkout session:", error);
    } finally {
      setLifetimeLoading(false);
    }
  };
  const connectToWebSocket = (billId) => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    setIsProcessing(true);
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/${billId}`;
    const socket = new WebSocket(wsUrl);
    webSocketRef.current = socket;
    socket.onopen = () => {};
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "completed") {
          setPaymentStatus("success");
          setPaymentMessage("Payment successful");
        } else if (data.status === "verifying") {
          setPaymentStatus("verifying");
          setPaymentMessage("Payment is being verified. Please wait...");
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          setPaymentMessage(
            data.message || "Payment failed. Please try again."
          );
          setIsProcessing(false);
          socket.close();
        } else if (data.qr_scanned) {
          setPaymentStatus("qr_scanned");
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setPaymentStatus("failed");
      }
    };
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setPaymentStatus("failed");
      setPaymentMessage("Connection error. Please try again.");
      setIsProcessing(false);
    };
    socket.onclose = () => {
      setIsProcessing(false);
    };
  };
  useEffect(() => {
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);
  useEffect(() => {
    if (paymentStatus === "success") {
      const timer = setTimeout(() => {
        setOpen(false);
        toast.success("Payment successful!!!");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#fdd8d9] dark:bg-[#ce2027]/20 rounded-lg">
          <Smartphone className="h-5 w-5 text-[#ce2027]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            FonePay Payment
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pay using FonePay mobile wallet
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
        {/* Annual Plan Card */}
        <PricingCard
          title="Premium Plan"
          price="10,000.00"
          period="/year"
          currency="NPR "
          features={premiumFeatures}
          loading={loading}
          onButtonClick={() => handleClick("annual", "Premium")}
          discountBadge="Popular"
          buttonColor="red"
          isSubscription={true}
        />
        {/* Lifetime Plan Card */}
        <PricingCard
          title="Premium Lifetime"
          price="14,999.00"
          period=""
          currency="NPR "
          features={lifetimeFeatures}
          isLifetime={true}
          isPopular={true}
          loading={lifetimeLoading}
          onButtonClick={handleLifetimeClick}
          limitedOffer={true}
          buttonColor="amber"
        />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white max-w-sm mx-auto">
          <DialogHeader className="text-center items-center">
            <div className="text-center">
              <Image
                className="h-10 w-32 mx-auto"
                src={`/assets/fonePay.png`}
                alt="fonePayImg"
                height={40}
                width={128}
              />
            </div>
          </DialogHeader>
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-center">
            Scan QR Code to Pay
          </DialogDescription>
          <div className="flex justify-center">
            <QRCodeSVG value={qrValue} size={200} marginSize={4} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="font-bold text-lg text-black dark:text-white">
              BRAND BUILDER PVT. LTD.
            </div>
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {planStatus + " " + "Plan"}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {"Amount: " +
                (planStatus === "Basic"
                  ? "20 USD / month"
                  : planStatus === "Premium"
                  ? "100 USD / year"
                  : planStatus === "Lifetime"
                  ? "99 USD one-time"
                  : "")}
            </div>
            {isProcessing && (
              <div className="mt-4 flex flex-col items-center gap-2 w-full">
                {paymentStatus === "success" ? (
                  <div className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 w-full">
                    <BadgeCheck className="text-green-500 h-8 w-8" />
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      Payment Successful!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      You now have access to all premium features
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      {paymentStatus === "verifying"
                        ? paymentMessage
                        : paymentStatus === "qr_scanned"
                        ? "QR Code Scanned! Please complete payment in your app."
                        : "Waiting for payment..."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
const RazorPayPayment = () => {
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
        onError: (err) => {
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
        onError: (err) => {
          const message = err?.message || "Payment failed";
          toast.error(err.response?.data?.detail || message);
          setLoadingPlan(null);
        },
      });
    }
  };
  return (
    <div className="space-y-8">
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
    </div>
  );
};
const PaymentSettings = () => {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select the perfect plan for your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>
      <Tabs defaultValue="stripe" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger
            value="stripe"
            className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-md transition-all"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Stripe</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              International
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="fonepay"
            className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-md transition-all"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="font-medium">FonePay</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Nepal
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="razorpay"
            className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-md transition-all"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="font-medium">RazorPay</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              India
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stripe" className="mt-0">
          <StripePayment />
        </TabsContent>
        <TabsContent value="fonepay" className="mt-0">
          <FonePayPayment />
        </TabsContent>
        <TabsContent value="razorpay" className="mt-0">
          <RazorPayPayment />
        </TabsContent>
      </Tabs>
    </div>
  );
};
const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
        Appearance
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Customize how the app looks.
      </p>
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-medium text-black dark:text-white mb-4">Theme</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setTheme("light")}
            variant={theme === "light" ? "default" : "outline"}
            className={`
              ${
                theme === "light"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white"
              }
              transition-all duration-200
            `}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
              Light
            </div>
          </Button>
          <Button
            onClick={() => setTheme("dark")}
            variant={theme === "dark" ? "default" : "outline"}
            className={`
              ${
                theme === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white"
              }
              transition-all duration-200
            `}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              Dark
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
const BillingSettings = () => (
  <div className="p-4 md:p-6">
    <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
      Billing Settings
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Manage your billing preferences and payment methods.
    </p>
    <div className="space-y-4">
      <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        <h3 className="font-medium text-black dark:text-white">
          Payment History
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View your past transactions and invoices
        </p>
      </Card>
      <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        <h3 className="font-medium text-black dark:text-white">
          Billing Address
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update your billing information
        </p>
      </Card>
    </div>
  </div>
);
export default function Setting() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("Billing Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showContent = () => {
    if (activeSection === "Billing Overview") return <BillingSettings />;
    if (activeSection === "Payment") return <PaymentSettings />;
    if (activeSection === "appearance") return <AppearanceSettings />;
    return <div className="p-6">Select a setting</div>;
  };
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`${
          sidebarOpen ? "hidden" : "block"
        } md:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm`}
        aria-label="Open menu"
      >
        <Menu size={20} className="text-black dark:text-white" />
      </button>
      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-black dark:text-white">
              Settings
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          {/* Added back button here */}
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
          <div className="space-y-6">
            <div>
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  Billing Settings
                </span>
              </div>
              <div className="space-y-1">
                {["Billing Overview", "Payment"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setActiveSection(item);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeSection === item
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  Appearance
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveSection("appearance");
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeSection === "appearance"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
              >
                Theme
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-16 md:pt-0">{showContent()}</div>
      </div>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}