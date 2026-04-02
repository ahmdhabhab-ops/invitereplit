import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowLeft, LogOut, DollarSign, Users, Clock, TrendingUp, Eye, EyeOff, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/Logo_1769975575984.png";

// ── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

// ── Types ────────────────────────────────────────────────────────────────────
interface ReferralDashboard {
  user: { id: string; fullName: string; email: string; referralCode: string; createdAt: string };
  commissions: Array<{
    id: string;
    clientName: string;
    orderAmount: number;
    commissionRate: number;
    commissionAmount: number;
    status: "pending" | "approved" | "paid";
    createdAt: string;
  }>;
  stats: { total: number; pending: number; paid: number; count: number };
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-blue-100 text-blue-800 border-blue-200",
    paid: "bg-green-100 text-green-800 border-green-200",
  };
  const labels: Record<string, string> = { pending: "Pending", approved: "Approved", paid: "Paid" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReferralPage() {
  const { t, formatPrice } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Session check ────────────────────────────────────────────────────────
  const { data: dashboard, isLoading } = useQuery<ReferralDashboard>({
    queryKey: ["/api/referral/dashboard"],
    retry: false,
  });

  // ── Register ─────────────────────────────────────────────────────────────
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await apiRequest("POST", "/api/referral/register", {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        passwordHash: "",
        referralCode: "",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/referral/dashboard"] });
      toast({ title: "Account created!", description: "Welcome to the Einvite affiliate program." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // ── Login ─────────────────────────────────────────────────────────────────
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await apiRequest("POST", "/api/referral/login", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/referral/dashboard"] });
      toast({ title: "Welcome back!", description: "You are now logged in." });
    },
    onError: (err: Error) => toast({ title: "Login failed", description: err.message, variant: "destructive" }),
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/referral/logout", {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/referral/dashboard"] });
      toast({ title: "Logged out successfully" });
    },
  });

  // ── Copy referral link ────────────────────────────────────────────────────
  const copyLink = () => {
    if (!dashboard) return;
    const link = `https://einvite.me/?ref=${dashboard.user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Copied!", description: "Your referral link is in your clipboard." });
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── DASHBOARD (logged in) ─────────────────────────────────────────────────
  if (dashboard) {
    const referralLink = `https://einvite.me/?ref=${dashboard.user.referralCode}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/">
              <img src={logoPath} alt="Einvite" className="h-8" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-referral-logout"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {dashboard.user.fullName.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Share your link and earn 30% commission on every confirmed order.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Earned", value: formatPrice(dashboard.stats.total), icon: DollarSign, color: "text-violet-600" },
              { label: "Pending", value: formatPrice(dashboard.stats.pending), icon: Clock, color: "text-amber-600" },
              { label: "Paid Out", value: formatPrice(dashboard.stats.paid), icon: TrendingUp, color: "text-green-600" },
              { label: "Referrals", value: String(dashboard.stats.count), icon: Users, color: "text-blue-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="font-bold text-gray-900">{value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Referral link */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={referralLink}
                  className="font-mono text-sm bg-gray-50"
                  data-testid="input-referral-link"
                />
                <Button
                  onClick={copyLink}
                  className="shrink-0"
                  data-testid="button-copy-referral-link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this link anywhere — social media, WhatsApp, email. You earn 30% of every confirmed order placed through your link.
              </p>
            </CardContent>
          </Card>

          {/* Commission history */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Commission History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dashboard.commissions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No commissions yet. Start sharing your link!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Order</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboard.commissions.map(c => (
                        <TableRow key={c.id} data-testid={`row-commission-${c.id}`}>
                          <TableCell className="font-medium">{c.clientName}</TableCell>
                          <TableCell className="text-right">{formatPrice(c.orderAmount)}</TableCell>
                          <TableCell className="text-right font-semibold text-violet-700">{formatPrice(c.commissionAmount)}</TableCell>
                          <TableCell><StatusBadge status={c.status} /></TableCell>
                          <TableCell className="text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="border shadow-sm bg-violet-50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-800 mb-3">How commissions work</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-violet-500 font-bold">1.</span> Share your unique referral link.</li>
                <li className="flex gap-2"><span className="text-violet-500 font-bold">2.</span> When someone places an order using your link, a commission is recorded.</li>
                <li className="flex gap-2"><span className="text-violet-500 font-bold">3.</span> We verify the order — status changes from <strong>Pending</strong> → <strong>Approved</strong> → <strong>Paid</strong>.</li>
                <li className="flex gap-2"><span className="text-violet-500 font-bold">4.</span> Payments are made via WhatsApp or bank transfer. Contact us to claim your earnings.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── LANDING + AUTH (not logged in) ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <img src={logoPath} alt="Einvite" className="h-8" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: pitch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200 font-medium">
              💰 Affiliate Program
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Make Money<br />
              <span className="text-primary">With Einvite</span>
            </h1>
            <p className="text-lg text-gray-600 mt-4 leading-relaxed">
              Refer clients to Einvite and earn <strong className="text-primary">30% commission</strong> on every confirmed order. No cap. No expiry.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: "💸", title: "30% Commission", desc: "Earn up to $60 per referral on Royal packages." },
              { icon: "🔗", title: "Unique Referral Link", desc: "Your personal link tracks every click and order automatically." },
              { icon: "📊", title: "Real-time Dashboard", desc: "See your earnings, pending commissions, and payment history." },
              { icon: "💬", title: "Easy Payouts", desc: "Get paid via WhatsApp transfer or bank transfer once approved." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="text-2xl">{icon}</div>
                <div>
                  <div className="font-semibold text-gray-800">{title}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Commission examples */}
          <div className="bg-white border rounded-xl p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Example Earnings</h3>
            {[
              { pkg: "Essential ($49)", commission: "$14.70" },
              { pkg: "Premium ($99)", commission: "$29.70" },
              { pkg: "Royal ($199)", commission: "$59.70" },
            ].map(({ pkg, commission }) => (
              <div key={pkg} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-gray-600">{pkg}</span>
                <span className="font-bold text-violet-700">{commission}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: auth form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <Tabs defaultValue="register">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="register" className="flex-1" data-testid="tab-referral-register">Create Account</TabsTrigger>
                  <TabsTrigger value="login" className="flex-1" data-testid="tab-referral-login">Log In</TabsTrigger>
                </TabsList>

                {/* Register */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(d => registerMutation.mutate(d))}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" data-testid="input-referral-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" data-testid="input-referral-register-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPw ? "text" : "password"}
                                  placeholder="Min. 8 characters"
                                  data-testid="input-referral-password"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPw(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPw ? "text" : "password"}
                                  placeholder="Repeat your password"
                                  data-testid="input-referral-confirm-password"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPw(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-referral-register"
                      >
                        {registerMutation.isPending ? "Creating account…" : "Create My Account"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Login */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(d => loginMutation.mutate(d))}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" data-testid="input-referral-login-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPw ? "text" : "password"}
                                  placeholder="Your password"
                                  data-testid="input-referral-login-password"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPw(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-referral-login"
                      >
                        {loginMutation.isPending ? "Logging in…" : "Log In to My Dashboard"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-gray-400 text-center mt-5">
                By creating an account you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
