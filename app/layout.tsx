import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/Theme/theme-provider";
import GoogleAnalytics from "./components/GoogleAnalytics";
import PageTracker from "./components/PageTracker";
import { Suspense } from "react";
import Script from "next/script";
import { UserProvider } from "@/context/UserContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RESUME AI",
  description: "This is the project for cv detailing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}
      >
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        {gaMeasurementId && (
          <>
            <GoogleAnalytics GA_MEASUREMENT_ID={gaMeasurementId} />
            <Suspense fallback={null}>
              <PageTracker />
            </Suspense>
          </>
        )}
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="">{children}</main>
            <Toaster richColors />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
