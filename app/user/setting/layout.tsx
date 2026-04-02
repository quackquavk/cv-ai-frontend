"use client";
import { useState, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Menu,
  X,
  ArrowLeft,
  LogOut,
  Key,
  CreditCard,
  Palette,
  Receipt,
  MessageCircle,
  Shield,
} from "lucide-react";
import axiosInstance from "@/utils/axiosConfig";
import { UserContext } from "@/context/UserContext";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userContext = useContext(UserContext);
  const { user, logout } = userContext;

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
    {
      category: "Account",
      items: [
        {
          name: "Danger Zone",
          href: "/user/setting/account/danger-zone",
          icon: Shield,
        },
      ],
    },
    ...(user?.is_admin
      ? [
          {
            category: "Administration",
            items: [
              {
                name: "Admin Panel",
                href: "/user/setting/admin",
                icon: Shield,
              },
            ],
          },
        ]
      : []),
  ];

  const handleLogOut = async () => {
    try {
      await axiosInstance.get("/user/logout");
      logout();
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
        <div className="max-w-4xl mx-auto pt-24 md:pt-0">{children}</div>
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
