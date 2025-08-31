import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

// Provider configurations (models will be fetched dynamically)
export const PROVIDER_CONFIGS = {
  openai: {
    name: "OpenAI",
    icon: "/svgs/openai.svg",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-transparent hover:text-inherit",
  },
  gemini: {
    name: "Google Gemini",
    icon: "/svgs/gemini.svg",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-transparent hover:text-inherit",
  },
  claude: {
    name: "Anthropic Claude",
    icon: "/svgs/claude.svg",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-transparent hover:text-inherit",
  },
};

// Status configurations
export const STATUS_CONFIGS = {
  active: { icon: CheckCircle, color: "text-green-500", label: "Active" },
  inactive: { icon: Clock, color: "text-gray-500", label: "Inactive" },
  invalid: { icon: XCircle, color: "text-red-500", label: "Invalid" },
  expired: { icon: AlertCircle, color: "text-orange-500", label: "Expired" },
};

// Plan features
export const freeFeatures = [
  { text: "Basic features" },
  { text: "Limited searches" },
  { text: "Claim your CV" },
];

export const lifetimeFeatures = [
  { text: "Private Folder" },
  { text: "Unlimited CV uploads" },
  { text: "Access to linkedin bots" },
];

export const premiumFeatures = [
  ...lifetimeFeatures,
  { text: "Priority support" },
  { text: "All future updates" },
];
