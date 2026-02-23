import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  DollarSign, 
  Mail, 
  Share2, 
  FileText,
  Package,
  Loader2,
  ExternalLink,
  Phone,
  Facebook,
  Instagram,
  X,
  Linkedin,
  LogIn,
  Briefcase,
  Users,
  Handshake,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Receipt,
  LayoutDashboard,
  MapPin,
  Music,
  MessageSquare,
  Calendar,
  User,
  Clock,
  ChevronRight,
  LogOut,
  Home,
  Image
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { SiteSettings, Order, JobOpening, JobApplication, PartnershipRequest } from "@shared/schema";
import { InvoiceManager } from "@/components/InvoiceManager";
import logoPath from "@assets/Logo_1769975575984.png";

type JobFormData = {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salaryRange: string;
  isActive: string;
};

const defaultJobForm: JobFormData = {
  title: "",
  department: "",
  location: "",
  type: "full-time",
  description: "",
  requirements: [""],
  responsibilities: [""],
  benefits: [""],
  salaryRange: "",
  isActive: "true",
};

type ActiveSection = 
  | "dashboard" 
  | "orders" 
  | "invoices" 
  | "jobs" 
  | "candidates" 
  | "partnerships" 
  | "general" 
  | "pricing" 
  | "contact" 
  | "social" 
  | "event-planners";

const menuItems = [
  { id: "dashboard" as ActiveSection, label: "Dashboard", icon: LayoutDashboard },
  { id: "orders" as ActiveSection, label: "Orders", icon: FileText },
  { id: "invoices" as ActiveSection, label: "Invoices", icon: Receipt },
  { id: "jobs" as ActiveSection, label: "Job Openings", icon: Briefcase },
  { id: "candidates" as ActiveSection, label: "Candidates", icon: Users },
  { id: "partnerships" as ActiveSection, label: "Partnerships", icon: Handshake },
];

const settingsItems = [
  { id: "general" as ActiveSection, label: "General", icon: Settings },
  { id: "pricing" as ActiveSection, label: "Pricing", icon: DollarSign },
  { id: "contact" as ActiveSection, label: "Contact", icon: Mail },
  { id: "social" as ActiveSection, label: "Social Media", icon: Share2 },
  { id: "event-planners" as ActiveSection, label: "Event Planners Page", icon: Handshake },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  // Job management state
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [jobForm, setJobForm] = useState<JobFormData>(defaultJobForm);
  const [viewingApplication, setViewingApplication] = useState<JobApplication | null>(null);

  // Check admin session
  const { data: sessionData, isLoading: sessionLoading, refetch: refetchSession } = useQuery<{ isAdmin: boolean; email?: string }>({
    queryKey: ["/api/admin/session"],
  });

  // Get site settings
  const { data: siteSettings, isLoading: settingsLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  // Get orders (only when admin is logged in)
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: sessionData?.isAdmin === true,
  });

  // Get job openings (only when admin is logged in)
  const { data: jobs, isLoading: jobsLoading } = useQuery<JobOpening[]>({
    queryKey: ["/api/jobs"],
    enabled: sessionData?.isAdmin === true,
  });

  // Get job applications (only when admin is logged in)
  const { data: applications, isLoading: applicationsLoading } = useQuery<JobApplication[]>({
    queryKey: ["/api/applications"],
    enabled: sessionData?.isAdmin === true,
  });

  // Get partnership requests (only when admin is logged in)
  const { data: partnershipRequests, isLoading: partnershipsLoading } = useQuery<PartnershipRequest[]>({
    queryKey: ["/api/partnership-requests"],
    enabled: sessionData?.isAdmin === true,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/admin/login", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      toast({ title: "Logged in successfully" });
    },
    onError: () => {
      toast({ title: "Invalid email or password", variant: "destructive" });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/logout", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      toast({ title: "Logged out successfully" });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<SiteSettings>) => {
      const res = await apiRequest("PATCH", "/api/settings", newSettings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (job: JobFormData) => {
      const res = await apiRequest("POST", "/api/jobs", job);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job created successfully" });
      setShowJobDialog(false);
      setJobForm(defaultJobForm);
    },
    onError: () => {
      toast({ title: "Failed to create job", variant: "destructive" });
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, job }: { id: string; job: Partial<JobFormData> }) => {
      const res = await apiRequest("PATCH", `/api/jobs/${id}`, job);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job updated successfully" });
      setShowJobDialog(false);
      setEditingJob(null);
      setJobForm(defaultJobForm);
    },
    onError: () => {
      toast({ title: "Failed to update job", variant: "destructive" });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/jobs/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete job", variant: "destructive" });
    },
  });

  // Update order payment status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/payment`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Payment status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update payment status", variant: "destructive" });
    },
  });

  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}/status`, { status, notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Application status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  // Update partnership request status mutation
  const updatePartnershipStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/partnership-requests/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partnership-requests"] });
      toast({ title: "Partnership status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (siteSettings) {
      setSettings(siteSettings);
    }
  }, [siteSettings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const updateField = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateFeatures = (tier: "essential" | "premium" | "royal", index: number, value: string) => {
    const key = `${tier}Features` as keyof SiteSettings;
    const features = [...((settings[key] as string[]) || [])];
    features[index] = value;
    updateField(key, features);
  };

  const addFeature = (tier: "essential" | "premium" | "royal") => {
    const key = `${tier}Features` as keyof SiteSettings;
    const features = [...((settings[key] as string[]) || []), ""];
    updateField(key, features);
  };

  const removeFeature = (tier: "essential" | "premium" | "royal", index: number) => {
    const key = `${tier}Features` as keyof SiteSettings;
    const features = ((settings[key] as string[]) || []).filter((_, i) => i !== index);
    updateField(key, features);
  };

  // Job form handlers
  const openCreateJobDialog = () => {
    setEditingJob(null);
    setJobForm(defaultJobForm);
    setShowJobDialog(true);
  };

  const openEditJobDialog = (job: JobOpening) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: (job.requirements as string[]) || [""],
      responsibilities: (job.responsibilities as string[]) || [""],
      benefits: (job.benefits as string[]) || [""],
      salaryRange: job.salaryRange || "",
      isActive: job.isActive || "true",
    });
    setShowJobDialog(true);
  };

  const handleSaveJob = () => {
    // Clean up empty strings from arrays
    const cleanedForm = {
      ...jobForm,
      requirements: jobForm.requirements.filter(r => r.trim()),
      responsibilities: jobForm.responsibilities.filter(r => r.trim()),
      benefits: jobForm.benefits.filter(b => b.trim()),
    };

    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, job: cleanedForm });
    } else {
      createJobMutation.mutate(cleanedForm);
    }
  };

  const updateJobFormField = (field: keyof JobFormData, value: any) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const updateJobFormArray = (field: "requirements" | "responsibilities" | "benefits", index: number, value: string) => {
    setJobForm(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addJobFormArrayItem = (field: "requirements" | "responsibilities" | "benefits") => {
    setJobForm(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeJobFormArrayItem = (field: "requirements" | "responsibilities" | "benefits", index: number) => {
    setJobForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs?.find(j => j.id === jobId);
    return job?.title || "Unknown Position";
  };

  if (sessionLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="admin-loading">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!sessionData?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4" data-testid="admin-login">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={logoPath} alt="Einvite" className="h-12" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>Sign in to manage your Einvite dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@einvite.me"
                  required
                  className="h-11"
                  data-testid="input-login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11"
                  data-testid="input-login-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Sign In
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                className="w-full"
                onClick={() => window.location.href = "/"}
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "60px",
  };

  // Dashboard overview stats
  const stats = {
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(o => o.paymentStatus === "pending").length || 0,
    totalJobs: jobs?.length || 0,
    activeJobs: jobs?.filter(j => j.isActive === "true").length || 0,
    totalApplications: applications?.length || 0,
    newApplications: applications?.filter(a => a.status === "new").length || 0,
    totalPartnerships: partnershipRequests?.length || 0,
    pendingPartnerships: partnershipRequests?.filter(p => p.status === "pending").length || 0,
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveSection("orders")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending payment</p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveSection("jobs")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Job Openings</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeJobs} active positions</p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveSection("candidates")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">{stats.newApplications} new applications</p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveSection("partnerships")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partnership Requests</CardTitle>
                  <Handshake className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPartnerships}</div>
                  <p className="text-xs text-muted-foreground">{stats.pendingPartnerships} pending review</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest customer orders</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveSection("orders")}>
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{order.names}</p>
                            <p className="text-sm text-muted-foreground">{order.eventType} - {order.packageType}</p>
                          </div>
                        </div>
                        <Badge variant={order.paymentStatus === "completed" ? "default" : "secondary"}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Customer Orders</h2>
              <p className="text-muted-foreground">View and manage all customer orders with complete details</p>
            </div>
            
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden" data-testid={`order-${order.id}`}>
                    <CardHeader 
                      className="cursor-pointer hover-elevate"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">{order.names}</CardTitle>
                              <Badge variant="outline" className="capitalize">{order.packageType}</Badge>
                              <Badge variant="secondary" className="capitalize">{order.eventType}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {order.eventDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={order.paymentStatus || "pending"}
                            onValueChange={(value) => {
                              updateOrderStatusMutation.mutate({ id: order.id, status: value });
                            }}
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <SelectTrigger 
                              className="w-[130px]" 
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`select-payment-status-${order.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                              <SelectItem value="pending" data-testid={`selectitem-status-pending-${order.id}`}>Pending</SelectItem>
                              <SelectItem value="completed" data-testid={`selectitem-status-completed-${order.id}`}>Completed</SelectItem>
                              <SelectItem value="failed" data-testid={`selectitem-status-failed-${order.id}`}>Failed</SelectItem>
                            </SelectContent>
                          </Select>
                          {order.paymentMethod === "whatsapp" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://wa.me/${settings.whatsappNumber?.replace(/[^0-9]/g, "")}`, "_blank");
                              }}
                              data-testid={`button-whatsapp-${order.id}`}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${expandedOrder === order.id ? "rotate-90" : ""}`} />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedOrder === order.id && (
                      <CardContent className="border-t bg-muted/20">
                        <div className="grid gap-6 pt-4">
                          {/* Order Summary */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Order Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-background rounded-lg border">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                                <p className="font-medium font-mono text-sm">{order.id}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Package</p>
                                <Badge variant="outline" className="capitalize">{order.packageType}</Badge>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Type</p>
                                <Badge variant="secondary" className="capitalize">{order.eventType}</Badge>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                                <p className="font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Event Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Names (Couple/Host)</p>
                                <p className="font-medium text-lg">{order.names}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                                <p className="font-medium text-lg">{order.eventDate}</p>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Contact Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background rounded-lg border">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Contact Name</p>
                                <p className="font-medium">{order.contactName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Email</p>
                                <a 
                                  href={`mailto:${order.contactEmail}`} 
                                  className="font-medium text-primary hover:underline"
                                  data-testid={`link-email-${order.id}`}
                                >
                                  {order.contactEmail}
                                </a>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                <a 
                                  href={`tel:${order.contactPhone}`} 
                                  className="font-medium text-primary hover:underline"
                                  data-testid={`link-phone-${order.id}`}
                                >
                                  {order.contactPhone}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Event Locations */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Event Locations {order.locations && Array.isArray(order.locations) ? `(${order.locations.length})` : ""}
                            </h4>
                            {order.locations && Array.isArray(order.locations) && order.locations.length > 0 ? (
                              <div className="grid gap-3">
                                {order.locations.map((location: { name: string; address: string; mapLink?: string }, idx: number) => (
                                  <div key={idx} className="p-4 bg-background rounded-lg border">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <p className="font-semibold">{location.name || `Location ${idx + 1}`}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{location.address || "No address provided"}</p>
                                        {location.mapLink && (
                                          <p className="text-xs text-muted-foreground mt-1 truncate">
                                            Map: {location.mapLink}
                                          </p>
                                        )}
                                      </div>
                                      {location.mapLink && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => window.open(location.mapLink, "_blank")}
                                          data-testid={`button-map-${order.id}-${idx}`}
                                        >
                                          <MapPin className="h-4 w-4 mr-1" />
                                          Open Map
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 bg-background rounded-lg border">
                                <p className="text-sm text-muted-foreground">No locations specified</p>
                              </div>
                            )}
                          </div>

                          {/* Customizations */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Customizations & Preferences
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background rounded-lg border">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <Music className="h-3 w-3" />
                                  Song Choice
                                </p>
                                <p className="font-medium">{order.songChoice || "Not specified"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  RSVP Preference
                                </p>
                                <p className="font-medium capitalize">{order.rsvpPreference || "Not specified"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Payment Method
                                </p>
                                <p className="font-medium capitalize">{order.paymentMethod}</p>
                              </div>
                            </div>
                          </div>

                          {/* Additional Notes */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Additional Notes
                            </h4>
                            <div className="p-4 bg-background rounded-lg border">
                              {order.additionalNotes ? (
                                <p className="text-sm whitespace-pre-wrap">{order.additionalNotes}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No additional notes provided</p>
                              )}
                            </div>
                          </div>

                          {/* Uploaded Media */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <Image className="h-4 w-4" />
                              Uploaded Media
                            </h4>
                            <div className="p-4 bg-background rounded-lg border">
                              {order.mediaUrls && Array.isArray(order.mediaUrls) && order.mediaUrls.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                  {order.mediaUrls.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group relative aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
                                      data-testid={`button-media-${order.id}-${idx}`}
                                    >
                                      <img
                                        src={url}
                                        alt={`Upload ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No media files uploaded</p>
                              )}
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div>
                            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Payment Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                                <p className="font-medium capitalize">{order.paymentMethod}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Payment Status</p>
                                <Select
                                  value={order.paymentStatus || "pending"}
                                  onValueChange={(value) => {
                                    updateOrderStatusMutation.mutate({ id: order.id, status: value });
                                  }}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <SelectTrigger className="w-[160px]" data-testid={`select-payment-status-detail-${order.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending" data-testid={`selectitem-status-detail-pending-${order.id}`}>Pending</SelectItem>
                                    <SelectItem value="completed" data-testid={`selectitem-status-detail-completed-${order.id}`}>Completed</SelectItem>
                                    <SelectItem value="failed" data-testid={`selectitem-status-detail-failed-${order.id}`}>Failed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-muted-foreground">Orders will appear here when customers submit them</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "invoices":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
              <p className="text-muted-foreground">Create and manage invoices for your customers</p>
            </div>
            <InvoiceManager />
          </div>
        );

      case "jobs":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Job Openings</h2>
                <p className="text-muted-foreground">Manage your job postings and career opportunities</p>
              </div>
              <Button onClick={openCreateJobDialog} data-testid="button-add-job">
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </div>
            
            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <Card key={job.id} data-testid={`job-${job.id}`}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">{job.title}</CardTitle>
                              <Badge variant={job.isActive === "true" ? "default" : "secondary"}>
                                {job.isActive === "true" ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{job.department}</span>
                              <span>{job.location}</span>
                              <span className="capitalize">{job.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditJobDialog(job)}
                            data-testid={`button-edit-job-${job.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteJobMutation.mutate(job.id)}
                            data-testid={`button-delete-job-${job.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">No job openings</p>
                  <p className="text-muted-foreground mb-4">Create your first job posting to start hiring</p>
                  <Button onClick={openCreateJobDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "candidates":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Job Applications</h2>
              <p className="text-muted-foreground">Review and manage candidate applications</p>
            </div>
            
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id} data-testid={`application-${app.id}`}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">{app.fullName}</CardTitle>
                              <Badge variant={
                                app.status === "hired" ? "default" :
                                app.status === "rejected" ? "destructive" :
                                app.status === "interviewing" || app.status === "offered" ? "default" :
                                "secondary"
                              }>
                                {app.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-primary font-medium mt-1">
                              Applied for: {getJobTitle(app.jobId)}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{app.email}</span>
                              <span>{app.phone}</span>
                              <span>{app.yearsOfExperience ? `${app.yearsOfExperience} years exp` : ""}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={app.status || "new"}
                            onValueChange={(value) => updateApplicationStatusMutation.mutate({ id: app.id, status: value })}
                          >
                            <SelectTrigger className="w-[140px]" data-testid={`select-status-${app.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="interviewing">Interviewing</SelectItem>
                              <SelectItem value="offered">Offered</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewingApplication(app)}
                            data-testid={`button-view-${app.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {app.resumeUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(app.resumeUrl!, "_blank")}
                              data-testid={`button-resume-${app.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">No applications yet</p>
                  <p className="text-muted-foreground">Applications will appear here when candidates apply</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "partnerships":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Partnership Requests</h2>
              <p className="text-muted-foreground">Manage partnership applications from event planners</p>
            </div>
            
            {partnershipsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : partnershipRequests && partnershipRequests.length > 0 ? (
              <div className="grid gap-4">
                {partnershipRequests.map((req) => (
                  <Card key={req.id} data-testid={`partnership-${req.id}`}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Handshake className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">{req.companyName}</CardTitle>
                              <Badge variant={
                                req.status === "approved" ? "default" :
                                req.status === "rejected" ? "destructive" :
                                req.status === "contacted" ? "secondary" :
                                "outline"
                              }>
                                {req.status}
                              </Badge>
                              <Badge variant="secondary">{req.eventsPerYear} events/year</Badge>
                            </div>
                            <p className="text-sm font-medium mt-1">{req.contactName}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{req.email}</span>
                              <span>{req.phone}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Events: {(req.eventTypes as string[]).join(", ")}
                            </p>
                            {req.message && (
                              <p className="text-sm text-muted-foreground mt-2 italic">"{req.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={req.status || "pending"}
                            onValueChange={(value) => updatePartnershipStatusMutation.mutate({ id: req.id, status: value })}
                          >
                            <SelectTrigger className="w-[140px]" data-testid={`select-partnership-status-${req.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          {req.website && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(req.website!, "_blank")}
                              data-testid={`button-website-${req.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Handshake className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">No partnership requests</p>
                  <p className="text-muted-foreground">Partnership requests will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
              <p className="text-muted-foreground">Customize your landing page hero and statistics</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Customize the main hero section of your landing page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroBadge">Badge Text</Label>
                  <Input
                    id="heroBadge"
                    value={settings.heroBadge || ""}
                    onChange={(e) => updateField("heroBadge", e.target.value)}
                    placeholder="#1 Digital Invitations in Lebanon"
                    data-testid="input-hero-badge"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Title</Label>
                  <Input
                    id="heroTitle"
                    value={settings.heroTitle || ""}
                    onChange={(e) => updateField("heroTitle", e.target.value)}
                    placeholder="Transform Your Celebrations"
                    data-testid="input-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={settings.heroSubtitle || ""}
                    onChange={(e) => updateField("heroSubtitle", e.target.value)}
                    placeholder="Beautiful, interactive digital invitations..."
                    data-testid="input-hero-subtitle"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Display social proof with key statistics</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="happyCouples">Happy Couples</Label>
                  <Input
                    id="happyCouples"
                    value={settings.happyCouplesCount || ""}
                    onChange={(e) => updateField("happyCouplesCount", e.target.value)}
                    placeholder="500+"
                    data-testid="input-happy-couples"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventsCreated">Events Created</Label>
                  <Input
                    id="eventsCreated"
                    value={settings.eventsCreatedCount || ""}
                    onChange={(e) => updateField("eventsCreatedCount", e.target.value)}
                    placeholder="1000+"
                    data-testid="input-events-created"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Customer Rating</Label>
                  <Input
                    id="rating"
                    value={settings.customerRating || ""}
                    onChange={(e) => updateField("customerRating", e.target.value)}
                    placeholder="4.9"
                    data-testid="input-customer-rating"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Pricing Settings</h2>
              <p className="text-muted-foreground">Configure your pricing packages and features</p>
            </div>
            
            {(["essential", "premium", "royal"] as const).map((tier) => (
              <Card key={tier}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Package
                    {tier === "premium" && <Badge variant="secondary">Popular</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      value={settings[`${tier}Price` as keyof SiteSettings] as number || ""}
                      onChange={(e) => updateField(`${tier}Price`, parseInt(e.target.value) || 0)}
                      data-testid={`input-${tier}-price`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="space-y-2">
                      {((settings[`${tier}Features` as keyof SiteSettings] as string[]) || []).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => updateFeatures(tier, index, e.target.value)}
                            placeholder={`Feature ${index + 1}`}
                            data-testid={`input-${tier}-feature-${index}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(tier, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFeature(tier)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Contact Information</h2>
              <p className="text-muted-foreground">Manage your contact details displayed on the site</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={settings.phoneNumber || ""}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    placeholder="+961 81 82 47 82"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="info@einvite.me"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsappNumber || ""}
                    onChange={(e) => updateField("whatsappNumber", e.target.value)}
                    placeholder="+96181824782"
                    data-testid="input-whatsapp"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "social":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Social Media</h2>
              <p className="text-muted-foreground">Configure your social media links</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    value={settings.facebookUrl || ""}
                    onChange={(e) => updateField("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/einviteme"
                    data-testid="input-facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    value={settings.instagramUrl || ""}
                    onChange={(e) => updateField("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/einviteme"
                    data-testid="input-instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    X (Twitter)
                  </Label>
                  <Input
                    value={settings.twitterUrl || ""}
                    onChange={(e) => updateField("twitterUrl", e.target.value)}
                    placeholder="https://twitter.com/einviteme"
                    data-testid="input-twitter"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    value={settings.linkedinUrl || ""}
                    onChange={(e) => updateField("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/company/einvite"
                    data-testid="input-linkedin"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <SiTiktok className="h-4 w-4" />
                    TikTok
                  </Label>
                  <Input
                    value={settings.tiktokUrl || ""}
                    onChange={(e) => updateField("tiktokUrl", e.target.value)}
                    placeholder="https://tiktok.com/@einviteme"
                    data-testid="input-tiktok"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "event-planners":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Event Planners Page</h2>
              <p className="text-muted-foreground">Customize the Event Planners partnership page content</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Customize the hero section of the Event Planners page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventPlannersBadge">Badge Text</Label>
                  <Input
                    id="eventPlannersBadge"
                    value={settings.eventPlannersBadge || ""}
                    onChange={(e) => setSettings({ ...settings, eventPlannersBadge: e.target.value })}
                    placeholder="For Event Professionals"
                    data-testid="input-event-planners-badge"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventPlannersHeroTitle">Hero Title</Label>
                  <Input
                    id="eventPlannersHeroTitle"
                    value={settings.eventPlannersHeroTitle || ""}
                    onChange={(e) => setSettings({ ...settings, eventPlannersHeroTitle: e.target.value })}
                    placeholder="Partner With Einvite"
                    data-testid="input-event-planners-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventPlannersHeroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="eventPlannersHeroSubtitle"
                    value={settings.eventPlannersHeroSubtitle || ""}
                    onChange={(e) => setSettings({ ...settings, eventPlannersHeroSubtitle: e.target.value })}
                    placeholder="Join our exclusive partner program..."
                    className="min-h-[80px]"
                    data-testid="input-event-planners-hero-subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Features (3 bullet points)</Label>
                  {(settings.eventPlannersHeroFeatures || ["", "", ""]).map((feature, index) => (
                    <Input
                      key={index}
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...(settings.eventPlannersHeroFeatures || ["", "", ""])];
                        newFeatures[index] = e.target.value;
                        setSettings({ ...settings, eventPlannersHeroFeatures: newFeatures });
                      }}
                      placeholder={`Feature ${index + 1}`}
                      data-testid={`input-event-planners-hero-feature-${index}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partner Benefits</CardTitle>
                <CardDescription>Manage the 6 partner benefits displayed on the page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const defaultBenefits = [
                    { title: "", description: "" },
                    { title: "", description: "" },
                    { title: "", description: "" },
                    { title: "", description: "" },
                    { title: "", description: "" },
                    { title: "", description: "" },
                  ];
                  const benefits = settings.eventPlannersBenefits && settings.eventPlannersBenefits.length >= 6 
                    ? settings.eventPlannersBenefits 
                    : defaultBenefits;
                  return benefits.map((benefit, index) => (
                    <div key={index} className="space-y-2 border-b pb-4 last:border-b-0">
                      <Label className="font-semibold">Benefit {index + 1}</Label>
                      <Input
                        value={benefit.title || ""}
                        onChange={(e) => {
                          const currentBenefits = settings.eventPlannersBenefits && settings.eventPlannersBenefits.length >= 6
                            ? [...settings.eventPlannersBenefits]
                            : [...defaultBenefits];
                          currentBenefits[index] = { ...currentBenefits[index], title: e.target.value };
                          setSettings({ ...settings, eventPlannersBenefits: currentBenefits });
                        }}
                        placeholder="Benefit title"
                        data-testid={`input-benefit-title-${index}`}
                      />
                      <Textarea
                        value={benefit.description || ""}
                        onChange={(e) => {
                          const currentBenefits = settings.eventPlannersBenefits && settings.eventPlannersBenefits.length >= 6
                            ? [...settings.eventPlannersBenefits]
                            : [...defaultBenefits];
                          currentBenefits[index] = { ...currentBenefits[index], description: e.target.value };
                          setSettings({ ...settings, eventPlannersBenefits: currentBenefits });
                        }}
                        placeholder="Benefit description"
                        className="min-h-[60px]"
                        data-testid={`input-benefit-description-${index}`}
                      />
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>

            {/* Partner Tiers */}
            {(["Silver", "Gold", "Platinum"] as const).map((tierName) => {
              const tierKey = tierName.toLowerCase() as "silver" | "gold" | "platinum";
              return (
                <Card key={tierName}>
                  <CardHeader>
                    <CardTitle>{tierName} Partner Tier</CardTitle>
                    <CardDescription>
                      Configure the {tierName} partner tier details
                      {tierName === "Gold" && " (Most Popular)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tier Name</Label>
                        <Input
                          value={(settings as any)[`eventPlanners${tierName}Name`] || ""}
                          onChange={(e) => setSettings({ ...settings, [`eventPlanners${tierName}Name`]: e.target.value })}
                          placeholder={`${tierName} Partner`}
                          data-testid={`input-${tierKey}-name`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Events Range</Label>
                        <Input
                          value={(settings as any)[`eventPlanners${tierName}Events`] || ""}
                          onChange={(e) => setSettings({ ...settings, [`eventPlanners${tierName}Events`]: e.target.value })}
                          placeholder={tierName === "Silver" ? "1-10 events/year" : tierName === "Gold" ? "11-50 events/year" : "51+ events/year"}
                          data-testid={`input-${tierKey}-events`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Discount</Label>
                        <Input
                          value={(settings as any)[`eventPlanners${tierName}Discount`] || ""}
                          onChange={(e) => setSettings({ ...settings, [`eventPlanners${tierName}Discount`]: e.target.value })}
                          placeholder={tierName === "Silver" ? "15%" : tierName === "Gold" ? "25%" : "40%"}
                          data-testid={`input-${tierKey}-discount`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Features (one per line)</Label>
                      <Textarea
                        value={((settings as any)[`eventPlanners${tierName}Features`] || []).join("\n")}
                        onChange={(e) => setSettings({ ...settings, [`eventPlanners${tierName}Features`]: e.target.value.split("\n").filter((f: string) => f.trim()) })}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        className="min-h-[100px]"
                        data-testid={`input-${tierKey}-features`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full" data-testid="admin-dashboard">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <img src={logoPath} alt="Einvite" className="h-8" />
              <div>
                <p className="font-semibold text-sm">Admin Portal</p>
                <p className="text-xs text-muted-foreground truncate">{sessionData.email}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t">
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = "/"}
              >
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold capitalize">
                {activeSection === "event-planners" ? "Event Planners Page" : activeSection}
              </h1>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </header>
          
          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job" : "Create New Job"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "Update job details below" : "Fill in the job details below"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={jobForm.title}
                  onChange={(e) => updateJobFormField("title", e.target.value)}
                  placeholder="e.g. Senior Designer"
                  data-testid="input-job-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={jobForm.department}
                  onChange={(e) => updateJobFormField("department", e.target.value)}
                  placeholder="e.g. Design"
                  data-testid="input-job-department"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={jobForm.location}
                  onChange={(e) => updateJobFormField("location", e.target.value)}
                  placeholder="e.g. Beirut, Lebanon"
                  data-testid="input-job-location"
                />
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={jobForm.type} onValueChange={(v) => updateJobFormField("type", v)}>
                  <SelectTrigger data-testid="select-job-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary Range (optional)</Label>
                <Input
                  value={jobForm.salaryRange}
                  onChange={(e) => updateJobFormField("salaryRange", e.target.value)}
                  placeholder="e.g. $50,000 - $70,000"
                  data-testid="input-job-salary"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={jobForm.isActive} onValueChange={(v) => updateJobFormField("isActive", v)}>
                  <SelectTrigger data-testid="select-job-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea
                value={jobForm.description}
                onChange={(e) => updateJobFormField("description", e.target.value)}
                placeholder="Describe the role and responsibilities..."
                className="min-h-[100px]"
                data-testid="input-job-description"
              />
            </div>
            
            {/* Requirements */}
            <div className="space-y-2">
              <Label>Requirements</Label>
              {jobForm.requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={req}
                    onChange={(e) => updateJobFormArray("requirements", index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                  />
                  {jobForm.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeJobFormArrayItem("requirements", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addJobFormArrayItem("requirements")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>
            
            {/* Responsibilities */}
            <div className="space-y-2">
              <Label>Responsibilities</Label>
              {jobForm.responsibilities.map((resp, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={resp}
                    onChange={(e) => updateJobFormArray("responsibilities", index, e.target.value)}
                    placeholder={`Responsibility ${index + 1}`}
                  />
                  {jobForm.responsibilities.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeJobFormArrayItem("responsibilities", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addJobFormArrayItem("responsibilities")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Responsibility
              </Button>
            </div>
            
            {/* Benefits */}
            <div className="space-y-2">
              <Label>Benefits</Label>
              {jobForm.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateJobFormArray("benefits", index, e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                  />
                  {jobForm.benefits.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeJobFormArrayItem("benefits", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addJobFormArrayItem("benefits")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Benefit
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJobDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveJob}
              disabled={createJobMutation.isPending || updateJobMutation.isPending}
              data-testid="button-save-job"
            >
              {(createJobMutation.isPending || updateJobMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingJob ? "Update Job" : "Create Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Application View Dialog */}
      <Dialog open={!!viewingApplication} onOpenChange={() => setViewingApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Viewing application from {viewingApplication?.fullName}
            </DialogDescription>
          </DialogHeader>
          {viewingApplication && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{viewingApplication.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Position Applied</Label>
                  <p className="font-medium">{getJobTitle(viewingApplication.jobId)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{viewingApplication.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{viewingApplication.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Years of Experience</Label>
                  <p className="font-medium">{viewingApplication.yearsOfExperience || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Applied Date</Label>
                  <p className="font-medium">
                    {viewingApplication.createdAt 
                      ? new Date(viewingApplication.createdAt).toLocaleDateString() 
                      : "N/A"}
                  </p>
                </div>
              </div>
              {viewingApplication.coverLetter && (
                <div>
                  <Label className="text-muted-foreground">Cover Letter</Label>
                  <p className="font-medium whitespace-pre-wrap mt-1 p-3 bg-muted rounded-md">
                    {viewingApplication.coverLetter}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                {viewingApplication.resumeUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(viewingApplication.resumeUrl!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                )}
                {viewingApplication.portfolioUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(viewingApplication.portfolioUrl!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Portfolio
                  </Button>
                )}
                {viewingApplication.linkedinUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(viewingApplication.linkedinUrl!, "_blank")}
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingApplication(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
