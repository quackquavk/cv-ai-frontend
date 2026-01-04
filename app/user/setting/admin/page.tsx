"use client";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/context/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import {
  Users,
  FileText,
  CreditCard,
  Mail,
  Shield,
  Search,
  Edit,
  Check,
  X,
  Loader2,
  TrendingUp,
  UserCheck,
  FileCheck,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

interface AdminDashboardSummary {
  total_users: number;
  premium_users: number;
  total_documents: number;
  new_users_today: number;
}

interface AdminUserDetails {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  premium: boolean;
  subscription_status?: string;
  subscription_plan?: string;
  subscription_tier?: string;
  created_at: string;
  document_count: number;
  resume_count: number;
  total_searches: number;
}

interface AdminDocumentSummary {
  total_documents: number;
  documents_today: number;
  average_documents_per_user: number;
}

interface AdminSubscriptionSummary {
  total_subscriptions: number;
  active_subscriptions: number;
  premium_users: number;
  subscriptions_by_plan: Record<string, number>;
}

interface TokenInfo {
  token: string;
  cv_id: string;
  email: string;
  uploaded_by: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
  used_by: string | null;
  is_expired: boolean;
  is_valid: boolean;
}

interface TokenStatistics {
  total_tokens: number;
  used_tokens: number;
  unused_tokens: number;
  valid_tokens: number;
  expired_unused_tokens: number;
  recent_tokens: TokenInfo[];
}

interface BulkEmailResponse {
  total_found: number;
  emails_sent: number;
  emails_failed: number;
  skipped: number;
  details: Array<{
    cv_id: string;
    email: string;
    status: string;
    reason?: string;
  }>;
}

interface DuplicateGroup {
  email: string;
  kept_cv_id: string;
  kept_cv_score: number;
  duplicate_cv_ids: string[];
  duplicate_cv_scores: number[];
  docs_migrated: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id?: string;
  created_at: string;
  is_resolved: boolean;
}

interface ContactStats {
  total_forms: number;
  resolved_forms: number;
  pending_forms: number;
  resolution_rate: number;
}

export default function AdminPage() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("dashboard");

  // State
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false);
  const [detectionRunning, setDetectionRunning] = useState(false);
  const [bulkDeleteRunning, setBulkDeleteRunning] = useState(false);

  // Data
  const [dashboardSummary, setDashboardSummary] =
    useState<AdminDashboardSummary | null>(null);
  const [documentSummary, setDocumentSummary] =
    useState<AdminDocumentSummary | null>(null);
  const [subscriptionSummary, setSubscriptionSummary] =
    useState<AdminSubscriptionSummary | null>(null);
  const [users, setUsers] = useState<AdminUserDetails[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [isPremiumFilter, setIsPremiumFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isAdminFilter, setIsAdminFilter] = useState<boolean | undefined>(
    undefined
  );
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(0);

  // Editing
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    is_admin?: boolean;
    premium?: boolean;
    subscription_status?: string;
  }>({});

  // CV Claims
  const [bulkEmailLimit, setBulkEmailLimit] = useState("50");
  const [forceResend, setForceResend] = useState(false);
  const [cvIdForClaim, setCvIdForClaim] = useState("");
  const [uploadedByName, setUploadedByName] = useState("");
  const [claimEmailLoading, setClaimEmailLoading] = useState(false);
  const [tokenStats, setTokenStats] = useState<TokenStatistics | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenLookup, setTokenLookup] = useState("");

  const pageSize = 20;

  // Load data on mount
  useEffect(() => {
    if (!user?.is_admin) return;
    loadDashboardData();
    loadUsers();
    loadTokenStatistics();
  }, [user?.is_admin]);

  // Auto-refetch when filters change
  useEffect(() => {
    if (!user?.is_admin || activeTab !== "users") return;
    setCurrentPage(0);
    loadUsers();
  }, [
    searchQuery,
    isPremiumFilter,
    isAdminFilter,
    sortBy,
    sortOrder,
    activeTab,
  ]);

  // Load contacts when tab is selected
  useEffect(() => {
    if (!user?.is_admin || activeTab !== "contacts") return;
    loadContacts();
  }, [activeTab, user?.is_admin]);

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const [contactsRes, statsRes] = await Promise.all([
        axiosInstance.get("/admin/contacts"),
        axiosInstance.get("/admin/contacts/stats"),
      ]);
      setContacts(contactsRes.data.contacts);
      setContactStats(statsRes.data);
    } catch (error: any) {
      console.error("Error loading contacts:", error);
      toast.error(error.response?.data?.detail || "Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, documentsRes, subscriptionsRes] = await Promise.all([
        axiosInstance.get("/admin/dashboard"),
        axiosInstance.get("/admin/documents/summary"),
        axiosInstance.get("/admin/subscriptions/summary"),
      ]);

      setDashboardSummary(dashboardRes.data);
      setDocumentSummary(documentsRes.data);
      setSubscriptionSummary(subscriptionsRes.data);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error(
        error.response?.data?.detail || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (reset = true) => {
    try {
      setUsersLoading(true);
      if (reset) setCurrentPage(0);

      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (isPremiumFilter !== undefined)
        params.append("is_premium", isPremiumFilter.toString());
      if (isAdminFilter !== undefined)
        params.append("is_admin", isAdminFilter.toString());
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);
      params.append("limit", pageSize.toString());
      params.append(
        "offset",
        reset ? "0" : (currentPage * pageSize).toString()
      );

      const response = await axiosInstance.get(`/admin/users?${params}`);
      const data = response.data;

      if (reset) {
        setUsers(data.users);
      } else {
        setUsers((prev) => [...prev, ...data.users]);
      }

      setTotalUsers(data.total_count);
      setHasMore(data.has_more);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(error.response?.data?.detail || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserEdit = (userData: AdminUserDetails) => {
    setEditingUser(userData.user_id);
    setEditForm({
      is_admin: userData.is_admin,
      premium: userData.premium,
      subscription_status: userData.subscription_status,
    });
  };

  const handleUserSave = async (userId: string) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}`, editForm);

      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId ? { ...user, ...editForm } : user
        )
      );

      setEditingUser(null);
      setEditForm({});
      toast.success("User updated successfully");
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.detail || "Failed to update user");
    }
  };

  const handleSendBulkEmails = async () => {
    try {
      setBulkEmailLoading(true);
      const params = new URLSearchParams();
      if (bulkEmailLimit) params.append("limit", bulkEmailLimit);
      if (forceResend) params.append("force_resend", "true");

      const response = await axiosInstance.post(
        `/cv-claim/admin/send-bulk-claim-emails?${params}`
      );
      const data: BulkEmailResponse = response.data;

      toast.success(
        `Bulk email operation completed: ${data.emails_sent} sent, ${data.skipped} skipped, ${data.emails_failed} failed`
      );
      await loadDashboardData();
    } catch (error: any) {
      console.error("Error sending bulk emails:", error);
      toast.error(error.response?.data?.detail || "Failed to send bulk emails");
    } finally {
      setBulkEmailLoading(false);
    }
  };

  const handleSendClaimEmail = async () => {
    if (!cvIdForClaim.trim()) {
      toast.error("Please enter a CV ID");
      return;
    }

    try {
      setClaimEmailLoading(true);
      const params = new URLSearchParams();
      if (uploadedByName) params.append("uploaded_by", uploadedByName);

      const response = await axiosInstance.post(
        `/cv-claim/admin/send-claim-email/${cvIdForClaim}?${params}`
      );
      const data = response.data;

      toast.success(`Claim email sent successfully to ${data.email}`);
      setCvIdForClaim("");
      setUploadedByName("");
    } catch (error: any) {
      console.error("Error sending claim email:", error);
      toast.error(error.response?.data?.detail || "Failed to send claim email");
    } finally {
      setClaimEmailLoading(false);
    }
  };

  const loadTokenStatistics = async () => {
    try {
      const response = await axiosInstance.get(
        "/cv-claim/admin/token-statistics"
      );
      setTokenStats(response.data);
    } catch (error: any) {
      console.error("Error loading token statistics:", error);
      toast.error(
        error.response?.data?.detail || "Failed to load token statistics"
      );
    }
  };

  const lookupToken = async () => {
    if (!tokenLookup.trim()) {
      toast.error("Please enter a token");
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/cv-claim/admin/token-info/${tokenLookup}`
      );
      setTokenInfo(response.data);
    } catch (error: any) {
      console.error("Error looking up token:", error);
      toast.error(error.response?.data?.detail || "Token not found or invalid");
      setTokenInfo(null);
    }
  };

  const handleRunDetection = async () => {
    try {
      setDetectionRunning(true);
      const response = await axiosInstance.post("/admin/duplicates/detect");

      if (response.data.success) {
        setDuplicateGroups(response.data.results || []);
        toast.success(
          `Detection completed. Processed ${response.data.groups_processed} groups.`
        );
      } else {
        toast.error(response.data.message || "Detection failed");
      }
    } catch (error: any) {
      console.error("Error running detection:", error);
      toast.error(error.response?.data?.detail || "Failed to run detection");
    } finally {
      setDetectionRunning(false);
    }
  };

  const handleDeleteDuplicates = async (cvIds: string[]) => {
    if (
      !confirm(`Are you sure you want to delete ${cvIds.length} duplicate CVs?`)
    )
      return;

    try {
      const response = await axiosInstance.post("/admin/duplicates/delete", {
        cv_ids: cvIds,
      });

      if (response.data.success) {
        // Remove deleted CVs from the local state
        setDuplicateGroups((prev) =>
          prev
            .map((group) => ({
              ...group,
              duplicate_cv_ids: group.duplicate_cv_ids.filter(
                (id) => !cvIds.includes(id)
              ),
            }))
            .filter((group) => group.duplicate_cv_ids.length > 0)
        );

        toast.success(
          response.data.message || "Duplicates deleted successfully"
        );
      } else {
        toast.error(response.data.message || "Failed to delete duplicates");
      }
    } catch (error: any) {
      console.error("Error deleting duplicates:", error);
      toast.error(
        error.response?.data?.detail || "Failed to delete duplicates"
      );
    }
  };

  const handleBulkDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL detected duplicate CVs? This action cannot be undone."
      )
    )
      return;

    try {
      setBulkDeleteRunning(true);
      const response = await axiosInstance.post("/admin/duplicates/delete-all");

      // The response contains the results of what was deleted.
      // We can assume that if successful, all duplicates are gone.
      setDuplicateGroups([]);
      toast.success(
        response.data.summary || "All duplicates deleted successfully"
      );
    } catch (error: any) {
      console.error("Error deleting all duplicates:", error);
      toast.error(
        error.response?.data?.detail || "Failed to delete all duplicates"
      );
    } finally {
      setBulkDeleteRunning(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadUsers(true);
  };

  const loadMoreUsers = () => {
    if (hasMore && !usersLoading) {
      setCurrentPage((prev) => prev + 1);
      loadUsers(false);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, documents, and system settings
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="cv-claims">CV Claims</TabsTrigger>
          <TabsTrigger value="duplicate-detection">Duplicates</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardSummary?.total_users || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardSummary?.new_users_today || 0} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Premium Users
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardSummary?.premium_users || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(
                    ((dashboardSummary?.premium_users || 0) /
                      (dashboardSummary?.total_users || 1)) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardSummary?.total_documents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{documentSummary?.documents_today || 0} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionSummary?.active_subscriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {subscriptionSummary?.total_subscriptions || 0} total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Document Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Documents per User</span>
                  <span className="font-semibold">
                    {documentSummary?.average_documents_per_user || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Documents Uploaded Today</span>
                  <span className="font-semibold">
                    {documentSummary?.documents_today || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Documents</span>
                  <span className="font-semibold">
                    {documentSummary?.total_documents || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionSummary?.subscriptions_by_plan &&
                  Object.entries(subscriptionSummary.subscriptions_by_plan).map(
                    ([plan, count]) => (
                      <div key={plan} className="flex justify-between">
                        <span className="capitalize">{plan}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    )
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Search, filter, and manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="premium">Premium</Label>
                  <Switch
                    id="premium"
                    checked={isPremiumFilter === true}
                    onCheckedChange={(checked) =>
                      setIsPremiumFilter(checked ? true : undefined)
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="admin">Admin</Label>
                  <Switch
                    id="admin"
                    checked={isAdminFilter === true}
                    onCheckedChange={(checked) =>
                      setIsAdminFilter(checked ? true : undefined)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Created</SelectItem>
                      <SelectItem value="username">Username</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSearch} disabled={usersLoading}>
                  {usersLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Docs</TableHead>
                      <TableHead>Resumes</TableHead>
                      <TableHead>Searches</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.is_admin && (
                              <Badge variant="destructive">Admin</Badge>
                            )}
                            {user.premium && (
                              <Badge variant="default">Premium</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.document_count}</TableCell>
                        <TableCell>{user.resume_count}</TableCell>
                        <TableCell>{user.total_searches}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {editingUser === user.user_id ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editForm.is_admin || false}
                                  onCheckedChange={(checked) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      is_admin: checked,
                                    }))
                                  }
                                />
                                <Label className="text-sm">Admin</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editForm.premium || false}
                                  onCheckedChange={(checked) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      premium: checked,
                                    }))
                                  }
                                />
                                <Label className="text-sm">Premium</Label>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUserSave(user.user_id)}
                                  disabled={usersLoading}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingUser(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreUsers}
                    disabled={usersLoading}
                  >
                    {usersLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Messages
              </CardTitle>
              <CardDescription>
                View and manage contact form submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              {contactStats && (
                <div className="grid gap-4 md:grid-cols-4 mb-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold">
                      {contactStats.total_forms}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {contactStats.pending_forms}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {contactStats.resolved_forms}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Resolved
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {contactStats.resolution_rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Rate</div>
                  </div>
                </div>
              )}

              {contactsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No contact messages found
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`border rounded-lg p-4 ${
                        contact.is_resolved ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{contact.name}</span>
                            <span className="text-muted-foreground text-sm">
                              &lt;{contact.email}&gt;
                            </span>
                            {contact.is_resolved ? (
                              <Badge variant="secondary" className="text-xs">
                                Resolved
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="font-medium text-sm mb-2">
                            {contact.subject}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {contact.message}
                          </p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(contact.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!contact.is_resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await axiosInstance.put(
                                    `/admin/contacts/${contact.id}/resolve`
                                  );
                                  setContacts((prev) =>
                                    prev.map((c) =>
                                      c.id === contact.id
                                        ? { ...c, is_resolved: true }
                                        : c
                                    )
                                  );
                                  toast.success("Marked as resolved");
                                } catch (e) {
                                  toast.error("Failed to resolve");
                                }
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (!confirm("Delete this message?")) return;
                              try {
                                await axiosInstance.delete(
                                  `/admin/contacts/${contact.id}`
                                );
                                setContacts((prev) =>
                                  prev.filter((c) => c.id !== contact.id)
                                );
                                toast.success("Deleted");
                              } catch (e) {
                                toast.error("Failed to delete");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Document Management
              </CardTitle>
              <CardDescription>
                Overview of document statistics and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {documentSummary?.total_documents || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Documents
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {documentSummary?.documents_today || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Uploaded Today
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {documentSummary?.average_documents_per_user || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg per User
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CV Claims Tab */}
        <TabsContent value="cv-claims" className="space-y-6">
          {/* Token Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Token Statistics
              </CardTitle>
              <CardDescription>
                Overview of CV claim token system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {tokenStats?.total_tokens || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tokens
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {tokenStats?.used_tokens || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Used Tokens
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {tokenStats?.unused_tokens || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Unused Tokens
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {tokenStats?.valid_tokens || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Valid Tokens
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {tokenStats?.expired_unused_tokens || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expired Unused
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={loadTokenStatistics}
                  variant="outline"
                  size="sm"
                >
                  Refresh Statistics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Send Individual Claim Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Individual Claim Email
              </CardTitle>
              <CardDescription>
                Send a claim email for a specific CV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cv-id">CV ID</Label>
                  <Input
                    id="cv-id"
                    placeholder="Enter CV ID (e.g., 507f1f77bcf86cd799439011)"
                    value={cvIdForClaim}
                    onChange={(e) => setCvIdForClaim(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uploaded-by">Uploaded By (Optional)</Label>
                  <Input
                    id="uploaded-by"
                    placeholder="Name of person who uploaded the CV"
                    value={uploadedByName}
                    onChange={(e) => setUploadedByName(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSendClaimEmail}
                disabled={claimEmailLoading}
                className="w-full md:w-auto"
              >
                {claimEmailLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Individual Claim Email
              </Button>
            </CardContent>
          </Card>

          {/* Send Bulk Claim Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Bulk Claim Emails
              </CardTitle>
              <CardDescription>
                Send claim emails to multiple CV owners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="limit">Email Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="Number of emails to send"
                    value={bulkEmailLimit}
                    onChange={(e) => setBulkEmailLimit(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="force-resend"
                    checked={forceResend}
                    onCheckedChange={setForceResend}
                  />
                  <Label htmlFor="force-resend">Force Resend</Label>
                </div>
              </div>
              <Button
                onClick={handleSendBulkEmails}
                disabled={bulkEmailLoading}
                className="w-full md:w-auto"
              >
                {bulkEmailLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Bulk Claim Emails
              </Button>
              <div className="text-sm text-muted-foreground">
                This will send CV claim emails to eligible CVs that haven't
                received them yet. Enable "Force Resend" to send emails to all
                CV owners regardless of previous sends.
              </div>
            </CardContent>
          </Card>

          {/* Token Lookup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Token Lookup
              </CardTitle>
              <CardDescription>
                Look up detailed information about a claim token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter claim token"
                  value={tokenLookup}
                  onChange={(e) => setTokenLookup(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={lookupToken} disabled={!tokenLookup.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup
                </Button>
              </div>

              {tokenInfo && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                  <h4 className="font-semibold">Token Information</h4>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <span className="font-medium">Token:</span>{" "}
                      <code className="text-xs">{tokenInfo.token}</code>
                    </div>
                    <div>
                      <span className="font-medium">CV ID:</span>{" "}
                      <code className="text-xs">{tokenInfo.cv_id}</code>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {tokenInfo.email}
                    </div>
                    <div>
                      <span className="font-medium">Uploaded By:</span>{" "}
                      {tokenInfo.uploaded_by}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(tokenInfo.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span>{" "}
                      {new Date(tokenInfo.expires_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge
                        variant={
                          tokenInfo.used
                            ? "destructive"
                            : tokenInfo.is_expired
                            ? "secondary"
                            : "default"
                        }
                      >
                        {tokenInfo.used
                          ? "Used"
                          : tokenInfo.is_expired
                          ? "Expired"
                          : tokenInfo.is_valid
                          ? "Valid"
                          : "Invalid"}
                      </Badge>
                    </div>
                    {tokenInfo.used_at && (
                      <div>
                        <span className="font-medium">Used At:</span>{" "}
                        {new Date(tokenInfo.used_at).toLocaleString()}
                      </div>
                    )}
                    {tokenInfo.used_by && (
                      <div>
                        <span className="font-medium">Used By:</span>{" "}
                        {tokenInfo.used_by}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duplicate Detection Tab */}
        <TabsContent value="duplicate-detection" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Duplicate CV Detection
                </CardTitle>
                <CardDescription>
                  Detect and manage duplicate CVs. Detection runs synchronously.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRunDetection}
                  disabled={detectionRunning || bulkDeleteRunning}
                >
                  {detectionRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Run Detection
                </Button>
                <Button
                  onClick={handleBulkDeleteAll}
                  disabled={bulkDeleteRunning}
                  variant="destructive"
                >
                  {bulkDeleteRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete All Duplicates
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {detectionRunning ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg">Running Detection</h3>
                    <p className="text-muted-foreground">
                      Analyzing CVs for duplicates. This may take a moment...
                    </p>
                  </div>
                </div>
              ) : duplicateGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center border-2 border-dashed rounded-lg">
                  <div className="bg-muted p-4 rounded-full">
                    <Copy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      No Duplicates Detected
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Run the detection process to identify potential duplicate
                      CVs across the system.
                    </p>
                  </div>
                  <Button onClick={handleRunDetection} variant="outline">
                    Run Detection Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <div className="text-sm text-muted-foreground">
                      Found {duplicateGroups.length} groups of duplicates
                    </div>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-4"
                  >
                    {duplicateGroups.map((group, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full">
                                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">
                                  {group.email}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {group.duplicate_cv_ids.length} potential
                                  duplicates found
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <div className="text-xs text-muted-foreground">
                                  Highest Similarity
                                </div>
                                <div className="font-medium text-orange-600">
                                  {Math.max(
                                    ...group.duplicate_cv_scores
                                  ).toFixed(1)}
                                  %
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 space-y-6">
                          {/* Kept CV Section */}
                          <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/20">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <h4 className="font-medium text-green-900 dark:text-green-100">
                                Original / Kept CV
                              </h4>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  CV ID
                                </div>
                                <code className="bg-white dark:bg-black/20 px-2 py-1 rounded text-sm border">
                                  {group.kept_cv_id}
                                </code>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  Quality Score
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={group.kept_cv_score}
                                    className="h-2 w-24"
                                  />
                                  <span className="text-sm font-medium">
                                    {group.kept_cv_score.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Duplicates Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <h4 className="font-medium text-red-900 dark:text-red-100">
                                  Duplicates to Delete
                                </h4>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteDuplicates(group.duplicate_cv_ids)
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete All {group.duplicate_cv_ids.length}{" "}
                                Duplicates
                              </Button>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead>Duplicate CV ID</TableHead>
                                    <TableHead>Similarity Score</TableHead>
                                    <TableHead>Docs to Migrate</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.duplicate_cv_ids.map((id, idx) => (
                                    <TableRow key={id}>
                                      <TableCell>
                                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                          {id}
                                        </code>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Progress
                                            value={
                                              group.duplicate_cv_scores[idx]
                                            }
                                            className="h-2 w-20"
                                            // indicatorClassName={group.duplicate_cv_scores[idx] > 0.9 ? "bg-red-600" : "bg-orange-500"}
                                          />
                                          <span className="text-sm font-medium">
                                            {group.duplicate_cv_scores[
                                              idx
                                            ].toFixed(1)}
                                            %
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          {group.docs_migrated} documents
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
