"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DangerZonePage() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isFormValid = username.length > 0 && password.length > 0;

  const handleDeleteAccount = async () => {
    if (!isFormValid) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await axiosInstance.delete("/user/account", {
        data: { password: password }
      });
      toast.success("Account deleted. We're sorry to see you go.");
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.response?.status === 401) {
        setError("Incorrect password. Please enter your correct password.");
      } else {
        setError(error.response?.data?.detail || "Failed to delete account");
      }
      toast.error(error.response?.data?.detail || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Danger Zone
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Irreversible actions for your account.
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-lg text-red-700 dark:text-red-400">
              Delete Account
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This will permanently delete your account and all associated data.
            This action cannot be undone. You will have a 14-day grace period before permanent deletion.
          </p>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={!isFormValid || isDeleting}
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete my account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
