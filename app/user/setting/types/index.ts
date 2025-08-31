// API Key Management Types and Interfaces
export interface ApiKey {
  api_key_id: string;
  user_id: string;
  provider: "openai" | "gemini" | "claude";
  model_name: string;
  is_enabled: boolean;
  status: "active" | "inactive" | "invalid" | "expired";
  masked_key: string;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  usage_count: number;
}

export interface UserSubscription {
  premium: boolean;
  subscription_status: string;
  subscription_plan: string;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean | null;
}

export interface SupportedModels {
  openai: string[];
  gemini: string[];
  claude: string[];
}

export interface Feature {
  text: string;
  highlight?: boolean;
}
