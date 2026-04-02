"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { Loader2 } from "lucide-react";
import { SubscriptionData } from "../hooks/useSubscription";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionData: SubscriptionData | null;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  subscriptionData,
}: CancelSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelType, setCancelType] = useState<"period_end" | "immediate" | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "your billing period ends";
    }
  };

  const handleCancelAtPeriodEnd = async () => {
    setIsLoading(true);
    setCancelType("period_end");
    try {
      await axiosInstance.post("/subscription/cancel-at-period-end");
      toast.success("Subscription canceled. You can reactivate anytime before your period ends.");
      onConfirm();
      onClose();
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      toast.error(error.response?.data?.detail || "Failed to cancel subscription");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setCancelType(null);
    }
  };

  const handleCancelImmediate = async () => {
    setIsLoading(true);
    setCancelType("immediate");
    try {
      await axiosInstance.delete("/subscription/cancel-immediate");
      toast.success("Subscription canceled immediately. You will not receive a refund for the current period.");
      onConfirm();
      onClose();
    } catch (error: any) {
      console.error("Error canceling subscription immediately:", error);
      toast.error(error.response?.data?.detail || "Failed to cancel subscription");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setCancelType(null);
    }
  };

  if (!subscriptionData || subscriptionData.is_lifetime) {
    return null;
  }

  const periodEnd = subscriptionData.current_period_end
    ? formatDate(subscriptionData.current_period_end)
    : "your billing period ends";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">
            Cancel your subscription?
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            You&apos;ll keep access until {periodEnd}. You can reactivate anytime before then.
          </DialogDescription>
        </DialogHeader>

        {!showConfirm ? (
          <DialogFooter className="flex-col gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              Keep my subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => { setShowConfirm(true); setCancelType("period_end"); }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Cancel at period end
            </Button>
            <Button
              variant="destructive"
              onClick={() => { setShowConfirm(true); setCancelType("immediate"); }}
              className="bg-red-800 text-white hover:bg-red-900"
            >
              Cancel immediately
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="flex-col gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => { setShowConfirm(false); setCancelType(null); }}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={cancelType === "period_end" ? handleCancelAtPeriodEnd : handleCancelImmediate}
              disabled={isLoading}
              className={cancelType === "immediate" ? "bg-red-800 text-white hover:bg-red-900" : "bg-red-600 text-white hover:bg-red-700"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : cancelType === "immediate" ? (
                "Confirm immediate cancellation"
              ) : (
                "Confirm cancellation at period end"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
