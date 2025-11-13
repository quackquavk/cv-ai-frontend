"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import {
  Bot,
  BotOff,
  Settings,
  Shield,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface LinkedInBotStatus {
  bot_id: string;
  is_active: boolean;
  email: string;
  has_credentials: boolean;
  last_used_at?: string;
  created_at: string;
}

interface LinkedInCredentials {
  bot_id: string;
  user_id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

interface LinkedInBotProps {
  className?: string;
}

const LinkedInBot: React.FC<LinkedInBotProps> = ({ className = "" }) => {
  const [botStatus, setBotStatus] = useState<LinkedInBotStatus | null>(null);
  const [botCredentials, setBotCredentials] = useState<LinkedInCredentials | null>(null);
  const [showBotSettings, setShowBotSettings] = useState<boolean>(false);
  const [showBotCredentials, setShowBotCredentials] = useState<boolean>(false);
  const [botLoading, setBotLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [botEmail, setBotEmail] = useState<string>('');
  const [botPassword, setBotPassword] = useState<string>('');
  const [botFormErrors, setBotFormErrors] = useState<{ email?: string; password?: string }>({});
  const [showDeactivateDialog, setShowDeactivateDialog] = useState<boolean>(false);
  const [showDeleteCredentialsDialog, setShowDeleteCredentialsDialog] = useState<boolean>(false);

  useEffect(() => {
    fetchBotStatus();
  }, []);

  const fetchBotStatus = async () => {
    try {
      const response = await axiosInstance.get("/linkedin_bot/status", {
        withCredentials: true,
      });
      if (response.data) {
        setBotStatus(response.data);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error fetching bot status:", error);
      }
    }
  };

  const fetchBotCredentials = async () => {
    try {
      const response = await axiosInstance.get("/linkedin_bot/credentials", {
        withCredentials: true,
      });
      if (response.data) {
        setBotCredentials(response.data);
        setBotEmail(response.data.email);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error fetching bot credentials:", error);
      }
    }
  };

  const validateBotForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!botEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(botEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!botPassword) {
      errors.password = "Password is required";
    } else if (botPassword.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setBotFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBotCredentials = async () => {
    if (!validateBotForm()) return;

    try {
      setBotLoading(true);
      await axiosInstance.post("/linkedin_bot/credentials", {
        email: botEmail,
        password: botPassword,
      }, {
        withCredentials: true,
      });

      toast.success("LinkedIn credentials created successfully!");
      setShowBotCredentials(false);
      setBotEmail('');
      setBotPassword('');
      setBotFormErrors({});
      fetchBotStatus();
      fetchBotCredentials();
    } catch (error: any) {
      console.error("Error creating bot credentials:", error);
      toast.error(error.response?.data?.detail || "Failed to create credentials");
    } finally {
      setBotLoading(false);
    }
  };

  const handleUpdateBotCredentials = async () => {
    if (!validateBotForm()) return;

    try {
      setBotLoading(true);
      const updateData: any = {};
      if (botEmail) updateData.email = botEmail;
      if (botPassword) updateData.password = botPassword;

      await axiosInstance.put("/linkedin_bot/credentials", updateData, {
        withCredentials: true,
      });

      toast.success("LinkedIn credentials updated successfully!");
      setShowBotCredentials(false);
      setBotEmail('');
      setBotPassword('');
      setBotFormErrors({});
      fetchBotStatus();
      fetchBotCredentials();
    } catch (error: any) {
      console.error("Error updating bot credentials:", error);
      toast.error(error.response?.data?.detail || "Failed to update credentials");
    } finally {
      setBotLoading(false);
    }
  };

  const handleDeleteBotCredentials = async () => {
    setShowDeleteCredentialsDialog(true);
  };

  const confirmDeleteBotCredentials = async () => {
    try {
      setBotLoading(true);
      await axiosInstance.delete("/linkedin_bot/credentials", {
        withCredentials: true,
      });

      toast.success("LinkedIn credentials deleted successfully!");
      setBotCredentials(null);
      setBotStatus(null);
      setShowBotCredentials(false);
      setBotEmail('');
      setBotPassword('');
      setBotFormErrors({});
      setShowDeleteCredentialsDialog(false);
    } catch (error: any) {
      console.error("Error deleting bot credentials:", error);
      toast.error(error.response?.data?.detail || "Failed to delete credentials");
    } finally {
      setBotLoading(false);
    }
  };

  const handleActivateBot = async () => {
    try {
      setBotLoading(true);
      const response = await axiosInstance.post("/linkedin_bot/activate", {}, {
        withCredentials: true,
      });

      if (response.data) {
        setBotStatus(response.data);
        toast.success("LinkedIn bot activated successfully!");
      }
    } catch (error: any) {
      console.error("Error activating bot:", error);
      toast.error(error.response?.data?.detail || "Failed to activate bot");
    } finally {
      setBotLoading(false);
    }
  };

  const handleDeactivateBot = async () => {
    setShowDeactivateDialog(true);
  };

  const confirmDeactivateBot = async () => {
    try {
      setBotLoading(true);
      const response = await axiosInstance.post("/linkedin_bot/deactivate", {}, {
        withCredentials: true,
      });

      if (response.data) {
        setBotStatus(response.data);
        toast.success("LinkedIn bot deactivated successfully!");
        setShowDeactivateDialog(false);
      }
    } catch (error: any) {
      console.error("Error deactivating bot:", error);
      toast.error(error.response?.data?.detail || "Failed to deactivate bot");
    } finally {
      setBotLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Collapsible Header */}
      <div
        className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
        onClick={() => {
          setShowBotSettings(!showBotSettings);
          if (!showBotSettings) {
            fetchBotCredentials();
          }
        }}
      >
        <div className="flex items-center space-x-2">
          {botStatus?.is_active ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          ) : botCredentials ? (
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          ) : (
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          )}
          <div className="flex items-center gap-2">
            {botStatus?.is_active ? <Bot className="h-4 w-4 text-green-600" /> : <BotOff className="h-4 w-4 text-gray-500" />}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              LinkedIn Bot {botStatus?.is_active ? "Active" : botCredentials ? "Configured" : "Not Setup"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showBotSettings && botStatus && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-24">
              {botStatus.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            {showBotSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showBotSettings ? 'max-h-96 mt-2' : 'max-h-0'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3">
          {/* Bot Status Card */}
          {botStatus && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Bot Status
                  </span>
                  <div className="flex items-center gap-1">
                    {botStatus.is_active ? (
                      <>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                {botStatus.is_active ? <Bot className="h-3 w-3 text-green-600" /> : <BotOff className="h-3 w-3 text-gray-500" />}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Email: {botStatus.email}
              </div>
              {botStatus.last_used_at && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Last used: {new Date(botStatus.last_used_at).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            {!botCredentials ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Setup Required
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                  Configure your LinkedIn credentials to enable automated job applications
                </p>
                <Button
                  onClick={() => {
                    setShowBotCredentials(true);
                    setShowBotSettings(false);
                  }}
                  className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Setup LinkedIn Credentials
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Credential Status */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Credentials
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Configured ✓
                  </span>
                </div>

                {/* Info Message */}
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    <strong>Note:</strong> Job applications will start slowly
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      setShowBotCredentials(true);
                      setShowBotSettings(false);
                    }}
                    variant="outline"
                    className="h-7 text-xs"
                    size="sm"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  {botStatus?.is_active ? (
                    <Button
                      onClick={handleDeactivateBot}
                      variant="outline"
                      className="h-7 text-xs text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      size="sm"
                      disabled={botLoading}
                    >
                      {botLoading ? <LoaderCircle className="h-3 w-3 animate-spin mr-1" /> : <BotOff className="h-3 w-3 mr-1" />}
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      onClick={handleActivateBot}
                      className="h-7 text-xs bg-green-600 hover:bg-green-700"
                      size="sm"
                      disabled={botLoading}
                    >
                      {botLoading ? <LoaderCircle className="h-3 w-3 animate-spin mr-1" /> : <Bot className="h-3 w-3 mr-1" />}
                      Activate
                    </Button>
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  onClick={handleDeleteBotCredentials}
                  variant="outline"
                  className="w-full h-7 text-xs text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  size="sm"
                  disabled={botLoading}
                >
                  Delete Credentials
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LinkedIn Bot Credentials Sheet */}
      <Sheet open={showBotCredentials} onOpenChange={setShowBotCredentials}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              LinkedIn Bot Credentials
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="botEmail">LinkedIn Email</Label>
              <Input
                id="botEmail"
                type="email"
                placeholder="your.linkedin@email.com"
                value={botEmail}
                onChange={(e) => setBotEmail(e.target.value)}
                className={botFormErrors.email ? "border-red-500" : ""}
              />
              {botFormErrors.email && (
                <p className="text-xs text-red-500">{botFormErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="botPassword">LinkedIn Password</Label>
              <div className="relative">
                <Input
                  id="botPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your LinkedIn password"
                  value={botPassword}
                  onChange={(e) => setBotPassword(e.target.value)}
                  className={`pr-10 ${botFormErrors.password ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {botFormErrors.password && (
                <p className="text-xs text-red-500">{botFormErrors.password}</p>
              )}
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Secure Storage</p>
                  <p>Your LinkedIn credentials are encrypted and stored securely. They will only be used for automated job applications when the bot is activated.</p>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBotCredentials(false);
                  setBotFormErrors({});
                  setBotEmail(botCredentials?.email || '');
                  setBotPassword('');
                }}
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={botCredentials ? handleUpdateBotCredentials : handleCreateBotCredentials}
              disabled={botLoading}
            >
              {botLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  {botCredentials ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {botCredentials ? "Update" : "Create"} Credentials
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Deactivate Bot Confirmation Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate LinkedIn Bot</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate the LinkedIn bot? This will stop all automated job applications until you reactivate it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeactivateDialog(false)}
              disabled={botLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeactivateBot}
              disabled={botLoading}
            >
              {botLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  Deactivating...
                </>
              ) : (
                "Deactivate Bot"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Credentials Confirmation Dialog */}
      <Dialog open={showDeleteCredentialsDialog} onOpenChange={setShowDeleteCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete LinkedIn Credentials</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your LinkedIn credentials? This action cannot be undone and you will need to reconfigure them to use the bot again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteCredentialsDialog(false)}
              disabled={botLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteBotCredentials}
              disabled={botLoading}
            >
              {botLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Credentials"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkedInBot;