"use client";
import { useState, useEffect, useRef, useContext } from "react";
import { Smartphone, Shield, Zap, BadgeCheck, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import Image from "next/image";
import axiosInstance from "@/utils/axiosConfig";
import { TrustIndicators } from "./TrustIndicators";
import { PricingCard } from "./PricingCard";
import { premiumFeatures, lifetimeFeatures, freeFeatures } from "../constants";
import { SubscriptionData } from "../hooks/useSubscription";
import { UserContext } from "@/context/UserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

interface FonePayPaymentProps {
  subscriptionData?: SubscriptionData | null;
}

export const FonePayPayment = ({ subscriptionData }: FonePayPaymentProps) => {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [lifetimeLoading, setLifetimeLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [planStatus, setPlanStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const webSocketRef = useRef<WebSocket | null>(null);

  const handleClick = async (selectedPlan: string, planStatus: string) => {
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
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      }
      console.error("Error creating lifetime checkout session:", error);
    } finally {
      setLifetimeLoading(false);
    }
  };

  const connectToWebSocket = (billId: string) => {
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
      const timer = setTimeout(async () => {
        setOpen(false);
        toast.success("Payment successful!!!");
        if (userContext?.refreshUser) {
          await userContext.refreshUser();
        }
        window.location.reload();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, userContext]);

  return (
    <div className="space-y-8 mt-12">
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
            currency="NPR "
            features={freeFeatures}
            loading={false}
            onButtonClick={() => (window.location.href = "/dashboard")}
            buttonColor="red"
            isSubscription={false}
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white max-w-sm mx-auto">
          <DialogHeader className="text-center items-center">
            <div className="text-center">
              <Image
                className="h-10 w-32 mx-auto"
                src={`/assets/fonePay.webp`}
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
