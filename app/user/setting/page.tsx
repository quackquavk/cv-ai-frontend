"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import { Menu, X, Loader2, BadgeCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

// Content Component

const BillingSettings = () => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
      Billing Settings
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      Manage your billing preferences and payment methods.
    </p>
    <div className="space-y-4">
      <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <h3 className="font-medium text-gray-800 dark:text-white">
          Payment History
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View your past transactions and invoices
        </p>
      </Card>
      <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <h3 className="font-medium text-gray-800 dark:text-white">
          Billing Address
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update your billing information
        </p>
      </Card>
    </div>
  </div>
);

const StripeSettings = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (selectedPlan, selectedTier) => {
    const body = {
      plan_id: `${selectedPlan}`,
      tier: `${selectedTier}`,
      success_url: "http://localhost:3000/user/setting",
      cancel_url: "http://localhost:3000/user/setting",
    };

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/payment/create-checkout-session",
        body
      );

      if (response.status === 200) {
        const url = response.data.checkout_url;
        window.location.href = url; // Redirect to Stripe Checkout
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

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Stripe Payment
        </h2>
        {/* <div>
        <Image
          className="h-8 w-20"
          src="/assets/stripe.svg"
          alt="Stripe"
          height={200}
          width={200}
        />
      </div> */}
      </div>
      <div className="flex gap-12">
        <Card className="flex flex-col gap-2 h-fit w-fit px-8 py-6">
          <p className="text-bold text-2xl">$20.00 / monthly</p>
          <p className="text-center font-semibold text-2xl">Basic</p>
          <p className="text-center">
            <Button onClick={() => handleClick("monthly", "basic")}>
              Choose this plan
            </Button>
          </p>
        </Card>

        <Card className="flex flex-col gap-2 h-fit w-fit px-8 py-6">
          <p className="text-bold text-2xl">$100.00 / annually</p>
          <p className="text-center font-semibold text-2xl">Premium</p>
          <p className="text-center">
            <Button onClick={() => handleClick("annual", "premium")}>
              Choose this plan
            </Button>
          </p>
        </Card>
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="loader border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}
    </div>
  );
};

const FonePaySettings = () => {
  const [loading, setLoading] = useState(false);
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

  const connectToWebSocket = (billId) => {
    if (webSocketRef.current) {
      // close the existing connection if it exists
      webSocketRef.current.close();
    }

    setIsProcessing(true);

    // Create new WebSocket Connection
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/${billId}`;

    const socket = new WebSocket(wsUrl);
    webSocketRef.current = socket;

    socket.onopen = () => {};

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "completed") {
          setPaymentStatus("success");
          setPaymentMessage("Payment successfull");
        } else if (data.status === "verifying") {
          setPaymentStatus("verifying");
          setPaymentMessage("Payment is being verified. Please wait...");
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          setPaymentMessage(
            data.message || "Payment failed. Please try again."
          );
          setIsProcessing(false);

          // Close the WebSocket connection after receiving a failure message
          socket.close();
        } else if (data.qr_scanned) {
          setPaymentStatus("qr_scanned");
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          setPaymentMessage(
            data.message || "Payment failed. Please try again."
          );
          setIsProcessing(false);

          // Close the WebSocket connection after receiving a failure message
          socket.onclose = () => {
            // WebSocket connection closed
            setIsProcessing(false);
          };
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

    // Close the connection when the WebSocket is closed
    socket.onclose = () => {
      // WebSocket connection closed
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close(); // Clean up WebSocket connection on unmount
      }
    };
  }, []);

  useEffect(() => {
    if (paymentStatus === "success") {
      const timer = setTimeout(() => {
        setOpen(false);
        toast.success("Payment successful!!!");
      }, 3500);
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [paymentStatus]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          FonePay Payment
        </h2>
      </div>
      <div className="flex gap-12">
        <Card className="flex flex-col gap-2 h-fit w-fit px-8 py-6">
          <p className="text-bold text-2xl">$20.00 / monthly</p>
          <p className="text-center font-semibold text-2xl">Basic</p>
          <p className="text-center">
            <Button onClick={() => handleClick("monthly", "Basic")}>
              Choose this plan
            </Button>
          </p>
        </Card>

        <Card className="flex flex-col gap-2 h-fit w-fit px-8 py-6">
          <p className="text-bold text-2xl">$100.00 / annually</p>
          <p className="text-center font-semibold text-2xl">Premium</p>
          <p className="text-center">
            <Button onClick={() => handleClick("yearly", "Premium")}>
              Choose this plan
            </Button>
          </p>
        </Card>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-96 dark:bg-white dark:text-black flex flex-col gap-3 items-center">
          <DialogHeader className="text-center items-center">
            <div className="text-center">
              <Image
                className="h-10 w-32"
                src={`/assets/fonePay.png`}
                alt="fonePayImg"
                height={200}
                width={200}
              />
            </div>
          </DialogHeader>
          <DialogDescription className=" dark:text-black">
            Scan QR Code to Pay
          </DialogDescription>
          <DialogDescription>
            <QRCodeSVG value={qrValue} size={256} marginSize={4} />
          </DialogDescription>
          <div className="flex flex-col  items-center">
            <div className="font-bold text-lg font-serif">
              BRAND BUILDER PVT. LTD.
            </div>
            <div className="font-semibold dark:text-black">
              {planStatus + " " + "Plan"}
            </div>
            <div className="flex">
              <p>
                {"Amount: " +
                  (planStatus === "Basic"
                    ? "20 USD / month"
                    : "100 USD / year")}
              </p>
            </div>
            {isProcessing && (
              <div className="mt-4 flex flex-grow items-center justify-center space-x-2">
                {paymentStatus === "success" ? (
                  <BadgeCheck className="text-green-500" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <p>
                  {paymentStatus === "verifying"
                    ? paymentMessage
                    : paymentStatus === "success"
                    ? paymentMessage
                    : "Waiting for payment..."}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="loader border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}
    </div>
  );
};

const AppearanceSettings = () => {
  // For Theme Change
  const { setTheme } = useTheme();

  // const isDarkMode =
  //   theme === "dark" || (theme === "system" && systemTheme === "dark");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Appearance
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Customize how the app looks.
      </p>
      <Card className="p-4">
        <h3 className="font-medium text-gray-800 dark:text-white">Theme</h3>
        <div className="flex space-x-2 mt-2">
          <button
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm"
            onClick={() => setTheme("light")}
          >
            Light
          </button>
          <button
            className="px-3 py-2 bg-gray-500 text-white rounded text-sm"
            onClick={() => setTheme("dark")}
          >
            Dark
          </button>
        </div>
      </Card>
    </div>
  );
};

function Setting() {
  const [activeSection, setActiveSection] = useState("billing");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simple function to show the right content
  const showContent = () => {
    if (activeSection === "billing") return <BillingSettings />;
    if (activeSection === "stripe") return <StripeSettings />;
    if (activeSection === "fonepay") return <FonePaySettings />;
    if (activeSection === "appearance") return <AppearanceSettings />;

    return <div className="p-6">Select a setting</div>;
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 md:p-20">
      {/* Mobile Toggle Button */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
          Settings
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-800 dark:text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block md:w-60 w-full bg-white dark:bg-gray-800 shadow-lg z-10 absolute md:relative top-16 md:top-0 left-0 md:left-auto md:shadow-none`}
        >
          <div className="p-4 space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                SETTINGS
              </h1>
              <div className="mb-2">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-3">
                  BILLING SETTINGS
                </span>
              </div>
              <div className="space-y-1">
                {["billing", "stripe", "fonepay"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setActiveSection(item);
                      setSidebarOpen(false); // close on mobile
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      activeSection === item
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-3">
                  APPEARANCE
                </span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSection("appearance");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeSection === "appearance"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Theme
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-4 pt-4 md:px-6">{showContent()}</div>
      </div>
    </div>
  );
}

export default Setting;
