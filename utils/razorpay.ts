import axiosInstance from "./axiosConfig";

export type PlanType = "monthly" | "annual" | "lifetime";

interface PaymentOptions {
  plan: PlanType;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

interface RazorpayConfigResponse {
  key_id: string;
  name?: string;
  image?: string;
  prefill?: Record<string, any>;
  theme?: Record<string, any>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class RazorpayService {
  private async waitForRazorpay(maxWaitMs: number = 5000): Promise<void> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) return resolve();
      const interval = setInterval(() => {
        if ((window as any).Razorpay) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() - start > maxWaitMs) {
          clearInterval(interval);
          reject(new Error("Razorpay SDK failed to load"));
        }
      }, 100);
    });
  }
  private async getConfig(): Promise<RazorpayConfigResponse> {
    const response = await axiosInstance.get("/razorpay/config");
    return response.data as RazorpayConfigResponse;
  }

  async initiatePayment(options: PaymentOptions) {
    try {
      const orderResponse = await axiosInstance.post("/razorpay/create-order", { plan: options.plan }, { withCredentials: true });

      if (orderResponse.status !== 200) {
        throw new Error(orderResponse.data.detail || "Failed to create order");
      }

      const orderData = orderResponse.data;
      const config = await this.getConfig();

      await this.waitForRazorpay();
      const razorpay = new window.Razorpay({
        key: config.key_id,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: config.name || "Payment",
        description: `${options.plan.charAt(0).toUpperCase() + options.plan.slice(1)} Plan`,
        image: config.image,
        prefill: config.prefill,
        theme: config.theme,
        handler: async (response: any) => {
          try {
            const verificationResponse = await axiosInstance.post("/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verificationResult = verificationResponse.data;
            if (verificationResult.status === "completed") {
              options.onSuccess?.(verificationResult);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            options.onError?.(err);
          }
        },
        modal: {
          ondismiss: () => {
            options.onError?.(new Error("Payment cancelled by user"));
          },
        },
      });

      razorpay.open();
    } catch (error) {
      options.onError?.(error);
    }
  }
}


