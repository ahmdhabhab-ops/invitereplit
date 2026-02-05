import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { SiteSettings, Order, JobOpening, JobApplication, PartnershipRequest } from "@shared/schema";

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

export default function AdminDashboard() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!sessionData?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" data-testid="admin-login">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
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
                  placeholder="admin@example.com"
                  required
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
                  data-testid="input-login-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Login
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

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.location.href = "/"}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{sessionData.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto p-2">
            <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
              <FileText className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2" data-testid="tab-jobs">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center gap-2" data-testid="tab-candidates">
              <Users className="h-4 w-4" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="partnerships" className="flex items-center gap-2" data-testid="tab-partnerships">
              <Handshake className="h-4 w-4" />
              Partnerships
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2" data-testid="tab-general">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2" data-testid="tab-pricing">
              <DollarSign className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2" data-testid="tab-contact">
              <Mail className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2" data-testid="tab-social">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="event-planners" className="flex items-center gap-2" data-testid="tab-event-planners">
              <Handshake className="h-4 w-4" />
              Event Planners Page
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
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
                            placeholder="Feature description"
                            data-testid={`input-${tier}-feature-${index}`}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeFeature(tier, index)}
                            data-testid={`button-remove-${tier}-feature-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addFeature(tier)}
                        data-testid={`button-add-${tier}-feature`}
                      >
                        Add Feature
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Your business contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={settings.phoneNumber || ""}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    placeholder="+961 81 82 47 82"
                    data-testid="input-phone-number"
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
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
                <CardDescription>Your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={settings.facebookUrl || ""}
                    onChange={(e) => updateField("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/einviteme"
                    data-testid="input-facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={settings.instagramUrl || ""}
                    onChange={(e) => updateField("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/einviteme"
                    data-testid="input-instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    X (Twitter)
                  </Label>
                  <Input
                    id="twitter"
                    value={settings.twitterUrl || ""}
                    onChange={(e) => updateField("twitterUrl", e.target.value)}
                    placeholder="https://twitter.com/einviteme"
                    data-testid="input-twitter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={settings.linkedinUrl || ""}
                    onChange={(e) => updateField("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/company/einviteme"
                    data-testid="input-linkedin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="flex items-center gap-2">
                    <SiTiktok className="h-4 w-4" />
                    TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    value={settings.tiktokUrl || ""}
                    onChange={(e) => updateField("tiktokUrl", e.target.value)}
                    placeholder="https://tiktok.com/@einviteme"
                    data-testid="input-tiktok"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Customer Orders
                </CardTitle>
                <CardDescription>
                  View all customer orders and client information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <Card 
                        key={order.id} 
                        className="overflow-hidden"
                        data-testid={`order-${order.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-lg">{order.names}</CardTitle>
                                <Badge variant="outline" className="capitalize">{order.packageType}</Badge>
                                <Badge variant="secondary" className="capitalize">{order.eventType}</Badge>
                              </div>
                              <CardDescription>
                                Order ID: {order.id} | Submitted: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={order.paymentStatus === "completed" ? "default" : "secondary"}
                              >
                                {order.paymentStatus}
                              </Badge>
                              {order.paymentMethod === "whatsapp" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(`https://wa.me/${settings.whatsappNumber?.replace(/[^0-9]/g, "")}`, "_blank")}
                                  data-testid={`button-whatsapp-${order.id}`}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  WhatsApp
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Contact Information */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-md">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contact Name</p>
                              <p className="font-medium">{order.contactName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                              <p className="font-medium">{order.contactEmail}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                              <p className="font-medium">{order.contactPhone}</p>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Event Date</p>
                              <p className="font-medium">{order.eventDate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment Method</p>
                              <p className="font-medium capitalize">{order.paymentMethod}</p>
                            </div>
                          </div>

                          {/* Locations */}
                          {order.locations && Array.isArray(order.locations) && order.locations.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Locations</p>
                              <div className="space-y-2">
                                {order.locations.map((location: { name: string; address: string; mapLink?: string }, idx: number) => (
                                  <div key={idx} className="p-3 border rounded-md">
                                    <p className="font-medium">{location.name}</p>
                                    <p className="text-sm text-muted-foreground">{location.address}</p>
                                    {location.mapLink && (
                                      <a 
                                        href={location.mapLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                      >
                                        View on Map
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Customizations */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {order.songChoice && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Song Choice</p>
                                <p className="font-medium">{order.songChoice}</p>
                              </div>
                            )}
                            {order.rsvpPreference && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">RSVP Preference</p>
                                <p className="font-medium capitalize">{order.rsvpPreference}</p>
                              </div>
                            )}
                          </div>

                          {/* Additional Notes */}
                          {order.additionalNotes && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Additional Notes</p>
                              <p className="text-sm p-3 bg-muted/50 rounded-md">{order.additionalNotes}</p>
                            </div>
                          )}

                          {/* Media URLs */}
                          {order.mediaUrls && Array.isArray(order.mediaUrls) && order.mediaUrls.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Uploaded Media</p>
                              <p className="text-sm">{order.mediaUrls.length} file(s) attached</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8" data-testid="no-orders-message">
                    No orders yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Openings
                  </CardTitle>
                  <CardDescription>
                    Manage job postings for your careers page
                  </CardDescription>
                </div>
                <Button onClick={openCreateJobDialog} data-testid="button-create-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md gap-4"
                        data-testid={`job-${job.id}`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{job.title}</span>
                            <Badge variant={job.isActive === "true" ? "default" : "secondary"}>
                              {job.isActive === "true" ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{job.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.department} | {job.location}
                            {job.salaryRange && ` | ${job.salaryRange}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditJobDialog(job)}
                            data-testid={`button-edit-job-${job.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteJobMutation.mutate(job.id)}
                            disabled={deleteJobMutation.isPending}
                            data-testid={`button-delete-job-${job.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8" data-testid="no-jobs-message">
                    No job openings yet. Click "Add Job" to create one.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Job Applications
                </CardTitle>
                <CardDescription>
                  Review and manage candidate applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div 
                        key={app.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md gap-4"
                        data-testid={`application-${app.id}`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{app.fullName}</span>
                            <Badge variant={
                              app.status === "hired" ? "default" :
                              app.status === "rejected" ? "destructive" :
                              app.status === "interviewing" || app.status === "offered" ? "default" :
                              "secondary"
                            }>
                              {app.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-primary font-medium">
                            Applied for: {getJobTitle(app.jobId)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {app.email} | {app.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Experience: {app.yearsOfExperience || "Not specified"} | Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={app.status || "new"}
                            onValueChange={(value) => updateApplicationStatusMutation.mutate({ id: app.id, status: value })}
                          >
                            <SelectTrigger className="w-[130px]" data-testid={`select-status-${app.id}`}>
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
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8" data-testid="no-applications-message">
                    No applications yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partnerships Tab */}
          <TabsContent value="partnerships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Partnership Requests
                </CardTitle>
                <CardDescription>
                  Manage partnership applications from event planners
                </CardDescription>
              </CardHeader>
              <CardContent>
                {partnershipsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : partnershipRequests && partnershipRequests.length > 0 ? (
                  <div className="space-y-4">
                    {partnershipRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md gap-4"
                        data-testid={`partnership-${req.id}`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{req.companyName}</span>
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
                          <p className="text-sm font-medium">{req.contactName}</p>
                          <p className="text-sm text-muted-foreground">
                            {req.email} | {req.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Events: {(req.eventTypes as string[]).join(", ")} | Applied: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                          {req.message && (
                            <p className="text-sm text-muted-foreground mt-2 italic">"{req.message}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={req.status || "pending"}
                            onValueChange={(value) => updatePartnershipStatusMutation.mutate({ id: req.id, status: value })}
                          >
                            <SelectTrigger className="w-[130px]" data-testid={`select-partnership-status-${req.id}`}>
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
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8" data-testid="no-partnerships-message">
                    No partnership requests yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Planners Page Content */}
          <TabsContent value="event-planners" className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Silver Partner Tier</CardTitle>
                <CardDescription>Configure the Silver partner tier details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tier Name</Label>
                    <Input
                      value={settings.eventPlannersSilverName || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersSilverName: e.target.value })}
                      placeholder="Silver Partner"
                      data-testid="input-silver-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events Range</Label>
                    <Input
                      value={settings.eventPlannersSilverEvents || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersSilverEvents: e.target.value })}
                      placeholder="1-10 events/year"
                      data-testid="input-silver-events"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input
                      value={settings.eventPlannersSilverDiscount || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersSilverDiscount: e.target.value })}
                      placeholder="15%"
                      data-testid="input-silver-discount"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={(settings.eventPlannersSilverFeatures || []).join("\n")}
                    onChange={(e) => setSettings({ ...settings, eventPlannersSilverFeatures: e.target.value.split("\n").filter(f => f.trim()) })}
                    placeholder="10% discount on all packages&#10;Standard support&#10;Partner badge"
                    className="min-h-[100px]"
                    data-testid="input-silver-features"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gold Partner Tier</CardTitle>
                <CardDescription>Configure the Gold partner tier details (Most Popular)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tier Name</Label>
                    <Input
                      value={settings.eventPlannersGoldName || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersGoldName: e.target.value })}
                      placeholder="Gold Partner"
                      data-testid="input-gold-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events Range</Label>
                    <Input
                      value={settings.eventPlannersGoldEvents || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersGoldEvents: e.target.value })}
                      placeholder="11-50 events/year"
                      data-testid="input-gold-events"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input
                      value={settings.eventPlannersGoldDiscount || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersGoldDiscount: e.target.value })}
                      placeholder="25%"
                      data-testid="input-gold-discount"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={(settings.eventPlannersGoldFeatures || []).join("\n")}
                    onChange={(e) => setSettings({ ...settings, eventPlannersGoldFeatures: e.target.value.split("\n").filter(f => f.trim()) })}
                    placeholder="25% discount on all packages&#10;Priority support&#10;White label option"
                    className="min-h-[100px]"
                    data-testid="input-gold-features"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platinum Partner Tier</CardTitle>
                <CardDescription>Configure the Platinum partner tier details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tier Name</Label>
                    <Input
                      value={settings.eventPlannersPlatinumName || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersPlatinumName: e.target.value })}
                      placeholder="Platinum Partner"
                      data-testid="input-platinum-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events Range</Label>
                    <Input
                      value={settings.eventPlannersPlatinumEvents || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersPlatinumEvents: e.target.value })}
                      placeholder="50+ events/year"
                      data-testid="input-platinum-events"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input
                      value={settings.eventPlannersPlatinumDiscount || ""}
                      onChange={(e) => setSettings({ ...settings, eventPlannersPlatinumDiscount: e.target.value })}
                      placeholder="40%"
                      data-testid="input-platinum-discount"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={(settings.eventPlannersPlatinumFeatures || []).join("\n")}
                    onChange={(e) => setSettings({ ...settings, eventPlannersPlatinumFeatures: e.target.value.split("\n").filter(f => f.trim()) })}
                    placeholder="40% discount on all packages&#10;Dedicated account manager&#10;Free rush delivery"
                    className="min-h-[100px]"
                    data-testid="input-platinum-features"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => updateSettingsMutation.mutate(settings)}
              disabled={updateSettingsMutation.isPending}
              className="w-full"
              data-testid="button-save-event-planners"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Event Planners Settings
            </Button>
          </TabsContent>
        </Tabs>
      </main>

      {/* Job Create/Edit Dialog */}
      <Dialog open={showJobDialog} onOpenChange={(open) => { if (!open) { setShowJobDialog(false); setEditingJob(null); setJobForm(defaultJobForm); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job" : "Create New Job"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "Update the job posting details" : "Fill in the details for the new job opening"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  value={jobForm.title}
                  onChange={(e) => updateJobFormField("title", e.target.value)}
                  placeholder="e.g., Senior Designer"
                  data-testid="input-job-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={jobForm.department} onValueChange={(v) => updateJobFormField("department", v)}>
                  <SelectTrigger data-testid="select-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select value={jobForm.location} onValueChange={(v) => updateJobFormField("location", v)}>
                  <SelectTrigger data-testid="select-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beirut">Beirut</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Type *</Label>
                <Select value={jobForm.type} onValueChange={(v) => updateJobFormField("type", v)}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <Input
                  value={jobForm.salaryRange}
                  onChange={(e) => updateJobFormField("salaryRange", e.target.value)}
                  placeholder="e.g., $40k-$60k"
                  data-testid="input-salary"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={jobForm.isActive} onValueChange={(v) => updateJobFormField("isActive", v)}>
                  <SelectTrigger data-testid="select-active">
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
              <Label>Description *</Label>
              <Textarea
                value={jobForm.description}
                onChange={(e) => updateJobFormField("description", e.target.value)}
                placeholder="Job description..."
                className="min-h-[80px]"
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Requirements</Label>
              {jobForm.requirements.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => updateJobFormArray("requirements", i, e.target.value)}
                    placeholder="Add requirement"
                    data-testid={`input-requirement-${i}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeJobFormArrayItem("requirements", i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addJobFormArrayItem("requirements")}>
                Add Requirement
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Responsibilities</Label>
              {jobForm.responsibilities.map((resp, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={resp}
                    onChange={(e) => updateJobFormArray("responsibilities", i, e.target.value)}
                    placeholder="Add responsibility"
                    data-testid={`input-responsibility-${i}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeJobFormArrayItem("responsibilities", i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addJobFormArrayItem("responsibilities")}>
                Add Responsibility
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Benefits</Label>
              {jobForm.benefits.map((benefit, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateJobFormArray("benefits", i, e.target.value)}
                    placeholder="Add benefit"
                    data-testid={`input-benefit-${i}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeJobFormArrayItem("benefits", i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addJobFormArrayItem("benefits")}>
                Add Benefit
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowJobDialog(false); setEditingJob(null); setJobForm(defaultJobForm); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveJob}
              disabled={createJobMutation.isPending || updateJobMutation.isPending || !jobForm.title || !jobForm.department || !jobForm.location || !jobForm.description}
              data-testid="button-save-job"
            >
              {(createJobMutation.isPending || updateJobMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingJob ? "Update Job" : "Create Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Application Dialog */}
      <Dialog open={!!viewingApplication} onOpenChange={(open) => { if (!open) setViewingApplication(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {viewingApplication?.fullName}'s application
            </DialogDescription>
          </DialogHeader>
          
          {viewingApplication && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{viewingApplication.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Position</p>
                  <p className="font-medium">{getJobTitle(viewingApplication.jobId)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingApplication.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewingApplication.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{viewingApplication.yearsOfExperience || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline">{viewingApplication.status}</Badge>
                </div>
              </div>

              {viewingApplication.coverLetter && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Cover Letter</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{viewingApplication.coverLetter}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {viewingApplication.resumeUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(viewingApplication.resumeUrl!, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-1" /> Resume
                  </Button>
                )}
                {viewingApplication.portfolioUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(viewingApplication.portfolioUrl!, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-1" /> Portfolio
                  </Button>
                )}
                {viewingApplication.linkedinUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(viewingApplication.linkedinUrl!, "_blank")}>
                    <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
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
    </div>
  );
}
