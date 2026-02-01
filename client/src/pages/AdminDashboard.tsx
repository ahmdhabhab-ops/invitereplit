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
  LogIn
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { SiteSettings, Order } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
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
            <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
              <FileText className="h-4 w-4" />
              Orders
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
                  Recent Orders
                </CardTitle>
                <CardDescription>
                  View and manage customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-4 border rounded-md"
                        data-testid={`order-${order.id}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{order.names}</span>
                            <Badge variant="outline">{order.packageType}</Badge>
                            <Badge variant="secondary">{order.eventType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.contactEmail} | {order.contactPhone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </p>
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
        </Tabs>
      </main>
    </div>
  );
}
