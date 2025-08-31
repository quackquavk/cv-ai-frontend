"use client";
import { Card } from "@/components/ui/card";

export default function BillingPage() {
  return (
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
}
