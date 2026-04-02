"use client";
import { BillingOverview } from "../components/BillingOverview";

export default function BillingPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Billing Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription, view invoices, and update payment methods.
        </p>
      </div>
      <BillingOverview />
    </div>
  );
}
