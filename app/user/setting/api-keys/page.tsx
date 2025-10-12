"use client";
import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Crown,
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Info,
  Shield,
  Zap,
  Globe,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import axiosInstance from "@/utils/axiosConfig";
import { TrustIndicators } from "../components/TrustIndicators";
import { PROVIDER_CONFIGS, STATUS_CONFIGS } from "../constants";
import { ApiKey, SupportedModels } from "../types";
import { UserContext } from "@/context/UserContext";

export default function ApiKeysPage() {
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const userLoading = userContext?.loading;

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportedModels, setSupportedModels] =
    useState<SupportedModels | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({
    provider: "" as "openai" | "gemini" | "claude",
    api_key: "",
    model_name: "",
    is_enabled: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState<string | null>(
    null
  );
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Check if user has premium access
  const hasPremiumAccess = user?.premium === true;

  useEffect(() => {
    fetchSupportedModels();
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      if (hasPremiumAccess) {
        fetchApiKeys();
      } else {
        setLoading(false);
      }
    }
  }, [user, userLoading, hasPremiumAccess]);

  const fetchSupportedModels = async () => {
    try {
      const response = await axiosInstance.get("/api_key/supported-models");
      setSupportedModels(response.data.supported_models);
    } catch (error) {
      console.error("Error fetching supported models:", error);
    }
  };

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api_key/");
      setApiKeys(response.data.api_keys || []);
    } catch (error: any) {
      console.error("Error fetching API keys:", error);
      if (error.response?.status === 403) {
        toast.error("You need a premium plan to manage API keys");
      } else {
        toast.error("Failed to fetch API keys");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async () => {
    if (!formData.provider || !formData.api_key || !formData.model_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setFormLoading(true);
    try {
      const response = await axiosInstance.post("/api_key/", {
        provider: formData.provider,
        api_key: formData.api_key,
        model_name: formData.model_name,
        is_enabled: formData.is_enabled,
        status: "active",
      });

      // If enabling this key, disable others
      if (formData.is_enabled) {
        const updatedKeys = apiKeys.map((key) => ({
          ...key,
          is_enabled: false,
        }));
        setApiKeys([...updatedKeys, response.data]);
      } else {
        setApiKeys([...apiKeys, response.data]);
      }

      setShowAddDialog(false);
      resetForm();
      toast.success(
        `${PROVIDER_CONFIGS[formData.provider].name} API key added successfully`
      );
    } catch (error: any) {
      console.error("Error adding API key:", error);
      if (error.response?.status === 400) {
        toast.error(
          error.response.data.detail || "Invalid API key or model name"
        );
      } else {
        toast.error("Failed to add API key");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!selectedApiKey) return;

    setFormLoading(true);
    try {
      const updateData: any = {
        is_enabled: formData.is_enabled,
      };

      if (formData.api_key && formData.api_key !== selectedApiKey.masked_key) {
        updateData.api_key = formData.api_key;
      }

      if (
        formData.model_name &&
        formData.model_name !== selectedApiKey.model_name
      ) {
        updateData.model_name = formData.model_name;
      }

      const response = await axiosInstance.put(
        `/api_key/${selectedApiKey.api_key_id}`,
        updateData
      );

      // If enabling this key, disable others
      if (formData.is_enabled && !selectedApiKey.is_enabled) {
        const updatedKeys = apiKeys.map((key) => ({
          ...key,
          is_enabled:
            key.api_key_id === selectedApiKey.api_key_id ? true : false,
        }));
        setApiKeys(updatedKeys);
      } else {
        setApiKeys(
          apiKeys.map((key) =>
            key.api_key_id === selectedApiKey.api_key_id ? response.data : key
          )
        );
      }

      setShowEditDialog(false);
      setSelectedApiKey(null);
      resetForm();
      toast.success("API key updated successfully");
    } catch (error: any) {
      console.error("Error updating API key:", error);
      toast.error(error.response?.data?.detail || "Failed to update API key");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!selectedApiKey) return;

    setFormLoading(true);
    try {
      await axiosInstance.delete(`/api_key/${selectedApiKey.api_key_id}`);
      setApiKeys(
        apiKeys.filter((key) => key.api_key_id !== selectedApiKey.api_key_id)
      );
      setShowDeleteDialog(false);
      setSelectedApiKey(null);
      toast.success("API key deleted successfully");
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    } finally {
      setFormLoading(false);
    }
  };

  const handleValidateApiKey = async (apiKey: ApiKey) => {
    setValidationLoading(apiKey.api_key_id);
    try {
      const response = await axiosInstance.post(
        `/api_key/${apiKey.api_key_id}/validate`
      );
      const newStatus = response.data.is_valid ? "active" : "invalid";

      setApiKeys(
        apiKeys.map((key) =>
          key.api_key_id === apiKey.api_key_id
            ? { ...key, status: newStatus }
            : key
        )
      );

      if (response.data.is_valid) {
        toast.success("API key is valid and working");
      } else {
        toast.error(response.data.error_message || "API key validation failed");
      }
    } catch (error) {
      console.error("Error validating API key:", error);
      toast.error("Failed to validate API key");
    } finally {
      setValidationLoading(null);
    }
  };

  const handleToggleApiKeyStatus = async (apiKey: ApiKey) => {
    try {
      // If we're enabling this key, first disable all other keys
      if (!apiKey.is_enabled) {
        const updatedKeys = apiKeys.map((key) => ({
          ...key,
          is_enabled: key.api_key_id === apiKey.api_key_id,
        }));

        // Update UI optimistically
        setApiKeys(updatedKeys);

        // Make API calls to update all keys
        await Promise.all(
          updatedKeys.map((key) =>
            axiosInstance.put(`/api_key/${key.api_key_id}`, {
              is_enabled: key.is_enabled,
            })
          )
        );

        toast.success("API key activated successfully");
      } else {
        // Just disable this key
        const updatedKey = { ...apiKey, is_enabled: false };
        setApiKeys(
          apiKeys.map((key) =>
            key.api_key_id === apiKey.api_key_id ? updatedKey : key
          )
        );

        await axiosInstance.put(`/api_key/${apiKey.api_key_id}`, {
          is_enabled: false,
        });
        toast.success("API key deactivated");
      }
    } catch (error) {
      console.error("Error toggling API key status:", error);
      toast.error("Failed to update API key status");
      // Revert changes on error
      fetchApiKeys();
    }
  };

  const resetForm = () => {
    setFormData({
      provider: "" as "openai" | "gemini" | "claude",
      api_key: "",
      model_name: "",
      is_enabled: true,
    });
  };

  const openEditDialog = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setFormData({
      provider: apiKey.provider,
      api_key: "",
      model_name: apiKey.model_name,
      is_enabled: apiKey.is_enabled,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setShowDeleteDialog(true);
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading || userLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!hasPremiumAccess) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <Key className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Premium Plan Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            API key management is available exclusively for premium users.
            Upgrade to manage your own OpenAI, Gemini, and Claude API keys.
          </p>
          <Button
            onClick={() => (window.location.href = "/user/setting/payment")}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                API Key Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your AI provider API keys for better performance
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white self-start sm:self-auto"
            disabled={apiKeys.length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add API Key
          </Button>
        </div>

        {/* Important note about single active key */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Only one API key can be activated at a time. When you activate a
                new key, any previously active key will be automatically
                deactivated.
              </p>
              <a
                href="/user/setting/docs"
                className="text-sm underline text-blue-700 dark:text-blue-400 hover:underline font-medium mt-2 inline-flex items-center gap-1"
              >
                Need help? Learn how to get a free Google AI API key
                <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <TrustIndicators
        indicators={[
          { icon: <Shield className="h-4 w-4" />, text: "Encrypted Storage" },
          { icon: <Zap className="h-4 w-4" />, text: "Auto Validation" },
          { icon: <Globe className="h-4 w-4" />, text: "Multi-Provider" },
        ]}
      />

      {/* API Keys List - Card-based layout for better responsiveness */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apiKeys.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Key className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  No API keys configured yet. Add your first API key to get
                  started.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          apiKeys.map((apiKey) => {
            const provider = PROVIDER_CONFIGS[apiKey.provider];
            const StatusIcon = STATUS_CONFIGS[apiKey.status].icon;

            return (
              <Card
                key={apiKey.api_key_id}
                className={`bg-white dark:bg-gray-900 border ${
                  apiKey.is_enabled
                    ? "border-blue-200 dark:border-blue-800"
                    : "border-gray-200 dark:border-gray-800"
                } hover:shadow-md transition-shadow`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src={provider.icon}
                        alt={provider.name}
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                    </div>
                    <Badge className={provider.color} >
                      {apiKey.provider.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Model
                      </span>
                    </div>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block w-full overflow-x-auto">
                      {apiKey.model_name}
                    </code>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        API Key
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleApiKeyVisibility(apiKey.api_key_id)
                        }
                        className="h-6 w-6 p-0"
                      >
                        {showApiKey[apiKey.api_key_id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block w-full overflow-x-auto font-mono">
                      {showApiKey[apiKey.api_key_id]
                        ? apiKey.masked_key
                        : "••••••••••••"}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={`h-4 w-4 ${
                          STATUS_CONFIGS[apiKey.status].color
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {STATUS_CONFIGS[apiKey.status].label}
                      </span>
                    </div>

                    <Switch
                      checked={apiKey.is_enabled}
                      onCheckedChange={() => handleToggleApiKeyStatus(apiKey)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Usage
                      </p>
                      <p className="text-sm font-medium">
                        {apiKey.usage_count} calls
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last Used
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(apiKey.last_used_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleValidateApiKey(apiKey)}
                      disabled={validationLoading === apiKey.api_key_id}
                      className="text-xs"
                    >
                      {validationLoading === apiKey.api_key_id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Validating
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validate
                        </>
                      )}
                    </Button>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(apiKey)}
                        className="h-8 w-8 p-0"
                        title="Edit API Key"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(apiKey)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Delete API Key"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Add API Key Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add New API Key</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new AI provider API key to use your own quota
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">AI Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value: "openai" | "gemini" | "claude") => {
                  setFormData({ ...formData, provider: value, model_name: "" });
                }}
                disabled={!supportedModels}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      supportedModels
                        ? "Select provider"
                        : "Loading providers..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={config.icon}
                          alt={config.name}
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.provider && (
              <div>
                <Label htmlFor="model">Model</Label>
                <Select
                  value={formData.model_name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, model_name: value })
                  }
                  disabled={
                    !supportedModels || !supportedModels[formData.provider]
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedModels && supportedModels[formData.provider] ? (
                      supportedModels[formData.provider].map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Loading models...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={formData.api_key}
                onChange={(e) =>
                  setFormData({ ...formData, api_key: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_enabled: checked })
                }
              />
              <Label htmlFor="enabled">Enable this API key</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddApiKey} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add API Key"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit API Key Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update your{" "}
              {selectedApiKey && PROVIDER_CONFIGS[selectedApiKey.provider].name}{" "}
              API key settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedApiKey && (
              <div>
                <Label htmlFor="model">Model</Label>
                <Select
                  value={formData.model_name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, model_name: value })
                  }
                  disabled={
                    !supportedModels ||
                    !supportedModels[selectedApiKey.provider]
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedModels &&
                    supportedModels[selectedApiKey.provider] ? (
                      supportedModels[selectedApiKey.provider].map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Loading models...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="apiKey">API Key (optional)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter new API key to update"
                value={formData.api_key}
                onChange={(e) =>
                  setFormData({ ...formData, api_key: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep current API key
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_enabled: checked })
                }
              />
              <Label htmlFor="enabled">Enable this API key</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateApiKey} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update API Key"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">
              Delete API Key
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this{" "}
              {selectedApiKey && PROVIDER_CONFIGS[selectedApiKey.provider].name}{" "}
              API key? This action cannot be undone and you'll need to add it
              again if you want to use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApiKey}
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
