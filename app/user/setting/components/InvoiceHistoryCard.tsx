"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";

interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  currency: string;
  created: number;
  hosted_invoice_url: string;
  status: string;
}

interface InvoiceListResponse {
  invoices: Invoice[];
  has_more: boolean;
}

export function InvoiceHistoryCard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axiosInstance.get<InvoiceListResponse>("/subscription/invoices");
      setInvoices(response.data.invoices || []);
      setHasMore(response.data.has_more || false);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoice history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-black dark:text-white">Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-black dark:text-white">Invoice History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No invoices found.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-black dark:text-white">
                    {formatDate(invoice.created)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatAmount(invoice.amount_paid, invoice.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {invoice.status}
                  </span>
                  {invoice.hosted_invoice_url && (
                    <a
                      href={invoice.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
            Only showing recent invoices.
          </p>
        )}
      </CardContent>
      {invoices.length > 0 && invoices[0]?.hosted_invoice_url && (
        <CardFooter>
          <a
            href={invoices[0].hosted_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              View All in Stripe
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
