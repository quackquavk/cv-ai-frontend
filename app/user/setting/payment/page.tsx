"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { StripePayment } from "../components/StripePayment";
import { FonePayPayment } from "../components/FonePayPayment";
import { RazorPayPayment } from "../components/RazorPayPayment";

export default function PaymentPage() {
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
          <StripePayment />
        </TabsContent>
        <TabsContent value="fonepay">
          <FonePayPayment />
        </TabsContent>
        <TabsContent value="razorpay">
          <RazorPayPayment />
        </TabsContent>
      </Tabs>
    </div>
  );
}
