"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to payment page as the default
    router.replace("/user/setting/payment");
  }, [router]);

  return null;
}
