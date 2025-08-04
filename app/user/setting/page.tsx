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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

// Content Components
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annual Plan Card */}
        <Card className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-black dark:text-white">
              $100.00
            </p>
            <span className="text-gray-600 dark:text-gray-400">/annually</span>
          </div>
          <p className="text-lg font-semibold text-black dark:text-white">
            Premium Plan
          </p>
          <Button
            onClick={() => handleClick("annual", "premium")}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Choose Premium Plan
          </Button>
        </Card>

        {/* Lifetime Plan Card */}
        <Card className="flex flex-col gap-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 hover:shadow-amber-100 dark:hover:shadow-amber-900/20 transition-all shadow-md">
 

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-bold text-black dark:text-white">
                $99.00
              </p>
            </div>
            <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              LIFETIME
            </span>
          </div>

          <p className="text-lg font-bold text-black dark:text-white">
            Premium Lifetime
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            One-time payment for lifetime access to all premium features.
            <span className="font-semibold text-red-500 dark:text-red-400">
              {" "}
              Limited to first 100 users only!
            </span>
          </p>

         

          <Button
            onClick={handleLifetimeClick}
            disabled={lifetimeLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium"
          >
            {lifetimeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Get Lifetime Access
          </Button>
        </Card>
      </div>
    </div>
  );
};
const FonePayPayment = () => {
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
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
      <div className="w-[300px]">
        <Card className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-black dark:text-white">
              NPR 10,000.00
            </p>
            <span className="text-gray-600 dark:text-gray-400">/annually</span>
          </div>
          <p className="text-lg font-semibold text-black dark:text-white">
            Premium Plan
          </p>
          <Button
            onClick={() => handleClick("annual", "Premium")}
            disabled={loading}
            className="w-full bg-[#ce2027] hover:bg-[#a61a20]] text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Choose Premium Plan
          </Button>
        </Card>
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
                (planStatus === "Basic" ? "20 USD / month" : "100 USD / year")}
            </div>
            {isProcessing && (
              <div className="mt-4 flex items-center gap-2">
                {paymentStatus === "success" ? (
                  <BadgeCheck className="text-green-500" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
                <p className="text-gray-700 dark:text-gray-300">
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
    </div>
  );
};
const RazorPayPayment = () => {
  // const [loading, setLoading] = useState(false);
  // const handleClick = async (selectedPlan, selectedTier) => {
  //   const body = {
  //     plan_id: `${selectedPlan}`,
  //     tier: `${selectedTier}`,
  //     success_url: "http://localhost:3000/user/setting",
  //     cancel_url: "http://localhost:3000/user/setting",
  //   };
  //   setLoading(true);
  //   try {
  //     const response = await axiosInstance.post(
  //       "/razorpay/create-checkout-session",
  //       body
  //     );
  //     if (response.status === 200) {
  //       const options = {
  //         key: response.data.key_id,
  //         amount: response.data.amount,
  //         currency: response.data.currency,
  //         name: "Brand Builder",
  //         description: `${selectedTier} Plan Subscription`,
  //         order_id: response.data.order_id,
  //         handler: (response) => {
  //           toast.success("Payment successful!");
  //           // Handle successful payment
  //           console.log("Payment successful:", response);
  //         },
  //         prefill: {
  //           name: "Customer Name",
  //           email: "customer@example.com",
  //           contact: "9999999999",
  //         },
  //         theme: {
  //           color: "#3B82F6",
  //         },
  //       };
  //       // const rzp = new window.Razorpay(options);
  //       // rzp.open();
  //     }
  //   } catch (error) {
  //     if (error.response?.status === 400) {
  //       toast.error(error.response.data.detail);
  //     }
  //     console.error("Error creating checkout session:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
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
      <div className="w-[300px]">
        <Card className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-black dark:text-white">
              INR 7,000.00
            </p>
            <span className="text-gray-600 dark:text-gray-400">/annually</span>
          </div>
          <p className="text-lg font-semibold text-black dark:text-white">
            Premium Plan
          </p>
          <Button
            // onClick={() => handleClick("annual", "premium")}
            // disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Choose Premium Plan
          </Button>
        </Card>
      </div>
    </div>
  );
};
const PaymentSettings = () => {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Payment Methods
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred payment method and subscription plan
        </p>
      </div>
      <Tabs defaultValue="stripe" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex text-lg items-center justify-center">
                <CreditCard className="font-semibold" />
                <span className="font-semibold font-sans">Stripe</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  For International Use
                </span>
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="fonepay" className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex text-lg items-center justify-center">
                <Smartphone className="font-semibold" />
                <span className="font-semibold font-sans">FonePay</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  For Nepal Use
                </span>
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="razorpay" className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex text-lg items-center justify-center">
                <Wallet className="font-semibold" />
                <span className="font-semibold font-sans">RazorPay</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  For India use
                </span>
              </div>
            </div>
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
function Setting() {
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
export default Setting;
