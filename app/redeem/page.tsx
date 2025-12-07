"use client";

import React, { useState, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Check,
  AlertCircle,
  Loader2,
  Star,
  Crown,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  Key,
  CreditCard,
  Palette,
  Receipt,
  MessageCircle,
} from "lucide-react";
import axiosInstance from "@/utils/axiosConfig";
import { UserContext } from "@/context/UserContext";
import confetti from "canvas-confetti";

interface RedemptionResponse {
  success: boolean;
  message: string;
  data?: any;
}

const navigationItems = [
  {
    category: "Billing Settings",
    items: [
      {
        name: "Payment",
        href: "/user/setting/payment",
        icon: CreditCard,
      },
      {
        name: "Billing Overview",
        href: "/user/setting/billing",
        icon: Receipt,
      },
    ],
  },
  {
    category: "AI Integration",
    items: [
      {
        name: "API Keys",
        href: "/user/setting/api-keys",
        icon: Key,
      },
    ],
  },
  {
    category: "Appearance",
    items: [
      {
        name: "Theme",
        href: "/user/setting/appearance",
        icon: Palette,
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        name: "Contact",
        href: "/user/setting/contact",
        icon: MessageCircle,
      },
    ],
  },
];

export default function RedeemPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userContext = useContext(UserContext);
  const { logout: contextLogout } = userContext;

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleLogOut = async () => {
    try {
      await axiosInstance.get("/user/logout");
      contextLogout();
      router.push("/auth/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/user/setting/payment" && pathname === "/user/setting") {
      return true; // Default route
    }
    return pathname === href;
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#f59e0b", "#f97316", "#eab308", "#fbbf24", "#fcd34d"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#f59e0b", "#f97316", "#eab308", "#fbbf24", "#fcd34d"],
      });
    }, 250);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setStatus("error");
      setMessage("Please enter your AppSumo code");
      return;
    }

    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await axiosInstance.post<RedemptionResponse>(
        "/appsumo/redeem",
        {
          code: code.trim(),
        }
      );

      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message || "Code redeemed successfully!");
        setCode("");

        triggerConfetti();
      } else {
        setStatus("error");
        setMessage(response.data.message || "Failed to redeem code");
      }
    } catch (error: any) {
      setStatus("error");
      if (error.response?.status === 401) {
        contextLogout();
        router.push("/auth/login");
        toast.error("Please log in to redeem your code");
        return;
      } else if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.status === 400) {
        setMessage("Invalid or expired code");
      } else if (error.response?.status === 409) {
        setMessage("This code has already been redeemed");
      } else {
        setMessage("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { text: "Unlimited CV generations" },
    { text: "Premium templates access" },
    { text: "Priority support" },
    { text: "Advanced AI features" },
    { text: "No monthly fees", highlight: true },
    { text: "Lifetime updates", highlight: true },
  ];

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

          {/* Back button */}
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>

          {/* Navigation */}
          <div className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.category}>
                <div className="mb-3">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                    {section.category}
                  </span>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <button
                          onClick={() => setSidebarOpen(false)}
                          className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                            isActiveRoute(item.href)
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          <Icon size={16} />
                          {item.name}
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Logout Button */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleLogOut}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-24 md:pt-0 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <Card className="flex flex-col gap-5 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              {/* AppSumo Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <Star className="h-3 w-3" />
                APPSUMO DEAL
              </div>

              {/* Header */}
              <div className="flex items-center gap-2 pt-4">
                <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-black dark:text-white">
                    Lifetime Access
                  </p>
                </div>
              </div>

              {/* Title */}
              <p className="text-lg font-bold text-black dark:text-white">
                AppSumo Redemption
              </p>

              {/* Features */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Everything in Premium, forever:
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
                          feature.highlight
                            ? "text-amber-500"
                            : "text-green-500"
                        }`}
                      />
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Redemption Form */}
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter your AppSumo code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="h-10 text-center font-mono tracking-wider border-2 border-amber-200 dark:border-gray-300 rounded-md"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !code.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-2.5 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Redeeming...
                    </>
                  ) : (
                    "Redeem Code"
                  )}
                </Button>
              </form>

              {/* Status Messages */}
              {status === "success" && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <span className="font-medium text-sm">Success!</span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 mt-1 text-sm">
                    {message}
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">Error</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1 text-sm">
                    {message}
                  </p>
                </div>
              )}

              {/* Help Text */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-500">
                One-time redemption. Lifetime access.
              </p>
            </Card>
          </div>
        </div>
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
