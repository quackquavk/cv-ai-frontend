export interface IUserType {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  premium: boolean;
  is_admin: boolean;
  google_id: string;
  picture: string;
  user_role?: "recruiter" | "candidate" | null;
  onboarding_completed?: boolean;
  referral_source?: string | null;
}
