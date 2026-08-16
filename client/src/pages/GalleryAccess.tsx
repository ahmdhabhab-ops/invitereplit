import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ExternalLink, Mail, Monitor, Upload, Search, CheckCircle } from "lucide-react";

interface GalleryAccessData {
  sessionId: string;
  eventName: string;
  isActive: boolean;
  uploadUrl: string;
  displayUrl: string;
  qrCodeDataUrl: string;
  smtpAvailable: boolean;
  contactEmailHint: string | null;
}

export default function GalleryAccess() {
  const params = new URLSearchParams(window.location.search);
  const initialOrderId = params.get("orderId") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState("");
  const [data, setData] = useState<GalleryAccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { toast } = useToast();

  async function lookupGallery() {
    const oid = orderId.trim();
    const em = email.trim();
    if (!oid) { setError("Please enter your order ID."); return; }
    if (!em) { setError("Please enter your email address."); return; }

    setLoading(true);
    setError(null);
    setData(null);
    setResent(false);

    try {
      const res = await fetch(
        `/api/gallery-access?orderId=${encodeURIComponent(oid)}&email=${encodeURIComponent(em)}`
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "An error occurred. Please try again.");
      } else {
        setData(json);
        // Reflect orderId in the URL without a full navigation
        const url = new URL(window.location.href);
        url.searchParams.set("orderId", oid);
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendEmail() {
    const oid = orderId.trim();
    const em = email.trim();
    if (!oid || !em) return;

    setResending(true);
    setResent(false);
    try {
      const res = await fetch(
        `/api/gallery-access/resend?orderId=${encodeURIComponent(oid)}&email=${encodeURIComponent(em)}`,
        { method: "POST" }
      );
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: "Could not resend email",
          description: json.error || "Please try again.",
          variant: "destructive",
        });
      } else {
        setResent(true);
        toast({
          title: "Email sent!",
          description: "Your gallery QR code has been re-sent to the email on file.",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Could not resend email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-start px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
          <QrCode className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Gallery Access</h1>
        <p className="text-slate-400 text-base max-w-md">
          Enter your order ID and the email address you used when placing the order to retrieve
          your Live Gallery QR code and links.
        </p>
      </div>

      {/* Lookup form */}
      <Card className="w-full max-w-lg bg-slate-800/60 border-slate-700 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-white text-lg">Find My Gallery</CardTitle>
          <CardDescription className="text-slate-400">
            Your order ID was included in your order confirmation. Both fields are required to
            verify your identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide block mb-1">
              Order ID
            </label>
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupGallery()}
              placeholder="e.g. a1b2c3d4-e5f6-..."
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide block mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupGallery()}
              placeholder="The email you used when ordering"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <Button
            onClick={lookupGallery}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Looking up…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Find My Gallery
              </span>
            )}
          </Button>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {data && (
        <div className="w-full max-w-lg space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Event info */}
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wide">Event</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    data.isActive
                      ? "bg-green-900/40 text-green-400 border border-green-800/40"
                      : "bg-slate-700 text-slate-400 border border-slate-600"
                  }`}
                >
                  {data.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h2 className="text-white text-xl font-semibold">{data.eventName}</h2>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
            <CardContent className="pt-6 flex flex-col items-center">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
                Guest Upload QR Code
              </p>
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                <img
                  src={data.qrCodeDataUrl}
                  alt="Guest upload QR code"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <p className="text-slate-400 text-sm text-center">
                Guests scan this to upload photos at your event.
              </p>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              {/* Upload link */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm font-semibold">Guest Upload Link</span>
                </div>
                <p className="text-slate-400 text-xs mb-3">
                  Share with guests who prefer a link over scanning a QR code.
                </p>
                <div className="flex gap-2">
                  <code className="text-blue-400 text-xs break-all flex-1 bg-slate-800/60 rounded px-3 py-2">
                    {data.uploadUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(data.uploadUrl);
                      toast({ title: "Copied!", description: "Upload link copied to clipboard." });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Display screen link */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300 text-sm font-semibold">Display Screen URL</span>
                </div>
                <p className="text-slate-400 text-xs mb-3">
                  Open on a large screen at your event to show the live photo feed.
                </p>
                <div className="flex gap-2">
                  <code className="text-purple-400 text-xs break-all flex-1 bg-slate-800/60 rounded px-3 py-2">
                    {data.displayUrl}
                  </code>
                  <a
                    href={data.displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Re-send email — only shown when SMTP is configured server-side */}
          {data.smtpAvailable && (
            <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-white text-sm font-semibold">Re-send QR Code Email</span>
                </div>
                {data.contactEmailHint && (
                  <p className="text-slate-400 text-sm mb-4">
                    We'll send the gallery email to{" "}
                    <span className="text-slate-200 font-medium">{data.contactEmailHint}</span> — the
                    address on file for this order.
                  </p>
                )}

                {resent ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-800/40 rounded-lg px-4 py-3">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Email sent! Check your inbox (and spam folder).
                  </div>
                ) : (
                  <Button
                    onClick={resendEmail}
                    disabled={resending}
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-700 w-full"
                  >
                    {resending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Re-send QR Code Email
                      </span>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Back to site */}
          <div className="text-center pb-4">
            <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              ← Back to eInvite.me
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
