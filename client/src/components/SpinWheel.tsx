import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SpinPrize } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Gift, X, Trophy, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "form" | "wheel" | "spinning" | "prize" | "blocked";

interface SpinResult {
  success?: boolean;
  blocked?: boolean;
  prizeIndex: number;
  prizeName: string;
  prizeEmoji: string;
  discountCode: string;
  expiresAt: string;
  message?: string;
}

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function shortName(name: string): string {
  if (name.length <= 14) return name;
  return name.substring(0, 13) + "…";
}

export function SpinWheel({ isOpen, onClose }: SpinWheelProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const confettiFrameRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState("");

  const { data: prizes = [] } = useQuery<SpinPrize[]>({
    queryKey: ["/api/spin/prizes"],
    enabled: isOpen,
  });

  // When modal opens, check localStorage immediately so we show blocked state
  useEffect(() => {
    if (!isOpen) return;
    const stored = localStorage.getItem("einvite_spin_used");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setSpinResult(data);
        setStep("blocked");
      } catch {
        // corrupt storage — clear it
        localStorage.removeItem("einvite_spin_used");
      }
    }
  }, [isOpen]);

  // Draw the wheel on canvas
  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(cx, cy) - 8;
    const n = prizes.length;
    const segAngle = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, W, H);

    // Outer shadow ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(147, 51, 234, 0.15)";
    ctx.fill();

    // Draw segments
    for (let i = 0; i < n; i++) {
      const startAngle = rotation + i * segAngle - Math.PI / 2;
      const endAngle = startAngle + segAngle;
      const prize = prizes[i];

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text inside segment
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      // Emoji
      ctx.font = `${Math.max(14, r * 0.1)}px serif`;
      ctx.fillText(prize.emoji, r - 8, -10);

      // Name
      ctx.font = `bold ${Math.max(10, r * 0.07)}px sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 3;
      ctx.fillText(shortName(prize.name), r - 8, 8);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    // Outer ring border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "#9333ea";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center circle
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(1, "#f3e8ff");
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#9333ea";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center star/icon
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎡", cx, cy);
  }, [prizes]);

  // Draw pointer (static, above canvas)
  useEffect(() => {
    if (step === "wheel" || step === "spinning") {
      drawWheel(rotationRef.current);
    }
  }, [prizes, step, drawWheel]);

  // Countdown timer
  useEffect(() => {
    if (!spinResult?.expiresAt) return;
    const tick = () => {
      const ms = new Date(spinResult.expiresAt).getTime() - Date.now();
      setCountdown(formatCountdown(ms));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [spinResult?.expiresAt]);

  // Confetti animation
  const startConfetti = useCallback(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#9333ea", "#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#fb923c", "#fff"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      w: 6 + Math.random() * 8,
      h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    }));

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.angle += p.spin;
        if (frame > 80) p.opacity = Math.max(0, p.opacity - 0.015);
        if (p.y < canvas.height + 20) alive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      frame++;
      if (alive && frame < 200) {
        confettiFrameRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    confettiFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Spin animation
  const animateSpin = useCallback((targetPrizeIndex: number) => {
    const n = prizes.length;
    if (n === 0) return;

    const segDeg = 360 / n;
    // Prize center angle from top (0°): targetPrizeIndex * segDeg + segDeg/2
    // We want this to land at 0° (top), so the wheel needs to rotate by:
    const prizeCenter = targetPrizeIndex * segDeg + segDeg / 2;
    const targetAngle = (360 - prizeCenter + 360) % 360;
    const totalDeg = 5 * 360 + targetAngle;
    const totalRad = (totalDeg * Math.PI) / 180;

    const duration = 5000;
    const startTime = performance.now();
    const startRot = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(t);
      const current = startRot + totalRad * eased;
      rotationRef.current = current;
      drawWheel(current);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = current;
        // Spin done — show prize
        setStep("prize");
        setTimeout(startConfetti, 100);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [prizes, drawWheel, startConfetti]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !weddingDate) return;

    // Client-side anti-abuse (localStorage)
    const alreadySpun = localStorage.getItem("einvite_spin_used");
    if (alreadySpun) {
      const data = JSON.parse(alreadySpun);
      setSpinResult(data);
      setStep("blocked");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/spin", { fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), weddingDate });
      const data: SpinResult = await res.json();

      if (data.blocked) {
        setSpinResult(data);
        setStep("blocked");
        return;
      }

      // Store in localStorage to prevent re-spin
      localStorage.setItem("einvite_spin_used", JSON.stringify({
        prizeName: data.prizeName,
        prizeEmoji: data.prizeEmoji,
        discountCode: data.discountCode,
        expiresAt: data.expiresAt,
      }));

      setSpinResult(data);
      setStep("wheel");

      // Start animation after a short delay (wheel needs to render first)
      setTimeout(() => {
        setStep("spinning");
        animateSpin(data.prizeIndex);
      }, 500);
    } catch (err: any) {
      if (err.message?.includes("409")) {
        // Server says IP already used
        toast({ title: "You've already used your spin!", variant: "destructive" });
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (!spinResult?.discountCode) return;
    navigator.clipboard.writeText(spinResult.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimationFrame(confettiFrameRef.current);
    };
  }, []);

  // Reset state when modal closes
  const handleClose = () => {
    cancelAnimationFrame(animFrameRef.current);
    cancelAnimationFrame(confettiFrameRef.current);
    setStep("form");
    setFullName("");
    setEmail("");
    setPhone("");
    setWeddingDate("");
    setSpinResult(null);
    setCopied(false);
    rotationRef.current = 0;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="max-w-lg w-full p-0 overflow-hidden border-0 shadow-2xl"
        data-testid="spin-wheel-modal"
      >
        <DialogTitle className="sr-only">Spin the Wheel — Win a Discount</DialogTitle>
        <DialogDescription className="sr-only">Fill in your details and spin to win an exclusive discount code.</DialogDescription>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-700 via-purple-600 to-violet-600 px-6 py-5 text-white">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            data-testid="button-close-spin-wheel"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl shadow-lg">
              🎡
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif leading-tight">Spin & Win!</h2>
              <p className="text-purple-200 text-sm">Exclusive discount for your special day</p>
            </div>
          </div>
        </div>

        <div className="bg-white">
          {/* STEP 1: Form */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <p className="text-center text-gray-500 text-sm">
                Fill in your details to unlock your free spin! 🎊
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="spin-name" className="text-sm font-semibold text-gray-700">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="spin-name"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  data-testid="input-spin-name"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="spin-email" className="text-sm font-semibold text-gray-700">
                  Email Address <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="spin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-spin-email"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="spin-phone" className="text-sm font-semibold text-gray-700">
                  Phone Number <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </Label>
                <Input
                  id="spin-phone"
                  type="tel"
                  placeholder="+961 71 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="input-spin-phone"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="spin-date" className="text-sm font-semibold text-gray-700">
                  Wedding / Event Date <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="spin-date"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                  data-testid="input-spin-date"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-3 text-base shadow-lg"
                disabled={isSubmitting || !fullName.trim() || !email.trim() || !weddingDate}
                data-testid="button-spin-submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Loading…
                  </span>
                ) : (
                  "🎡 Spin the Wheel!"
                )}
              </Button>

              <p className="text-center text-xs text-gray-400">
                One spin per person · Valid for 48 hours
              </p>
            </form>
          )}

          {/* STEP 2: Wheel (brief show before spinning) */}
          {(step === "wheel" || step === "spinning") && (
            <div className="p-6 flex flex-col items-center gap-4">
              <p className="text-center text-gray-500 text-sm font-medium">
                {step === "wheel" ? "Your wheel is ready..." : "🤞 Spinning…"}
              </p>

              {/* Pointer */}
              <div className="relative flex flex-col items-center">
                <div
                  className="w-0 h-0 z-10"
                  style={{
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: "22px solid #9333ea",
                    filter: "drop-shadow(0 2px 4px rgba(147,51,234,0.5))",
                  }}
                />
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="rounded-full shadow-xl"
                  data-testid="canvas-spin-wheel"
                />
              </div>

              {step === "spinning" && (
                <p className="text-purple-600 font-semibold animate-pulse text-sm">
                  Good luck! 🍀
                </p>
              )}
            </div>
          )}

          {/* STEP 3: Prize won */}
          {step === "prize" && spinResult && (
            <div className="relative overflow-hidden">
              {/* Confetti canvas overlay */}
              <canvas
                ref={confettiRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10 }}
              />

              <div className="p-6 text-center space-y-4 relative z-20">
                <div className="text-6xl animate-bounce">{spinResult.prizeEmoji}</div>

                <div>
                  <p className="text-sm text-purple-600 font-semibold uppercase tracking-widest mb-1">
                    🎉 You won!
                  </p>
                  <h3 className="text-2xl font-bold font-serif text-gray-900">
                    {spinResult.prizeName}
                  </h3>
                </div>

                {/* Discount code */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-dashed border-purple-300 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Your exclusive code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className="font-mono font-bold text-2xl text-purple-700 tracking-widest"
                      data-testid="text-discount-code"
                    >
                      {spinResult.discountCode}
                    </span>
                    <button
                      onClick={copyCode}
                      className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                      data-testid="button-copy-code"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-4 py-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Valid for: </span>
                  <span className="font-mono font-bold text-sm" data-testid="text-countdown">
                    {countdown}
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Share this code when placing your order via WhatsApp
                </p>

                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                  data-testid="button-claim-prize"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim My Prize
                </Button>
              </div>
            </div>
          )}

          {/* BLOCKED: Already spun */}
          {step === "blocked" && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">You already spun!</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Each person gets one spin. Here's the code you won:
                </p>
              </div>

              {spinResult && (
                <>
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-dashed border-purple-300 rounded-xl p-4">
                    <p className="text-lg font-semibold text-purple-700 mb-2">
                      {spinResult.prizeEmoji} {spinResult.prizeName}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono font-bold text-xl text-purple-700 tracking-widest">
                        {spinResult.discountCode}
                      </span>
                      <button
                        onClick={copyCode}
                        className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {spinResult.expiresAt && (
                    <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-4 py-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Expires in: </span>
                      <span className="font-mono font-bold text-sm">{countdown}</span>
                    </div>
                  )}
                </>
              )}

              <Button onClick={handleClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Floating trigger button + banner section for landing page
interface SpinBannerProps {
  onOpen: () => void;
}

export function SpinBanner({ onOpen }: SpinBannerProps) {
  return (
    <section
      className="relative overflow-hidden py-12 px-4"
      style={{
        background: "linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #c026d3 100%)",
      }}
      data-testid="section-spin-banner"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-white/5" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white/5 -translate-y-1/2" />

      <div className="relative max-w-2xl mx-auto text-center text-white">
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-lg">
          ✨ Limited Time Offer
        </div>

        <h2 className="text-3xl md:text-4xl font-bold font-serif mb-3">
          🎡 Spin & Win a Discount!
        </h2>
        <p className="text-purple-200 text-base md:text-lg mb-6 max-w-md mx-auto">
          Try your luck and win up to <strong className="text-white">FREE invitation suite</strong> or a
          big discount on your digital invitation.
        </p>

        {/* Prize pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-7">
          {["10% Off 💸", "25% Off 🔥", "50% Off 💣", "Free Suite 🎁", "Free Edits ✍️"].map((p) => (
            <span
              key={p}
              className="bg-white/15 border border-white/25 px-3 py-1 rounded-full text-sm font-medium text-white"
            >
              {p}
            </span>
          ))}
        </div>

        <Button
          onClick={onOpen}
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-base px-8 py-4 shadow-xl transition-all hover:scale-105 active:scale-95"
          data-testid="button-open-spin"
        >
          🎡 Spin the Wheel — It's Free!
        </Button>

        <p className="text-purple-300 text-xs mt-3">
          One spin per person · Enter your details to play
        </p>
      </div>
    </section>
  );
}

// --- Floating action button ---
interface SpinFloatingButtonProps {
  onOpen: () => void;
}

export function SpinFloatingButton({ onOpen }: SpinFloatingButtonProps) {
  return (
    <>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes pulse-ring2 {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(1.85); opacity: 0; }
          100% { transform: scale(1.85); opacity: 0; }
        }
        @keyframes badge-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        .spin-float-btn:hover .spin-emoji {
          animation-duration: 0.6s;
        }
      `}</style>

      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2"
        style={{ pointerEvents: "none" }}
      >
        {/* Bouncing badge label */}
        <div
          className="bg-yellow-400 text-yellow-900 text-xs font-extrabold px-3 py-1 rounded-full shadow-lg select-none"
          style={{
            animation: "badge-bounce 2s ease-in-out infinite",
            pointerEvents: "none",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}
        >
          🎁 Spin & Win!
        </div>

        {/* Button with pulsing rings */}
        <div className="relative" style={{ pointerEvents: "auto" }}>
          {/* Outer pulse ring */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, #a855f7 0%, #7c3aed 100%)",
              animation: "pulse-ring2 2.4s ease-out infinite",
              animationDelay: "0.4s",
            }}
          />
          {/* Inner pulse ring */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, #a855f7 0%, #7c3aed 100%)",
              animation: "pulse-ring 2.4s ease-out infinite",
            }}
          />

          {/* Main button */}
          <button
            onClick={onOpen}
            className="spin-float-btn relative flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 transition-transform duration-200 hover:scale-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)",
              border: "2px solid rgba(255,255,255,0.25)",
            }}
            data-testid="button-spin-float"
            aria-label="Spin the Wheel to win a discount"
          >
            {/* Spinning wheel emoji */}
            <span
              className="spin-emoji text-2xl leading-none"
              style={{ animation: "spin-slow 3s linear infinite" }}
            >
              🎡
            </span>
            <span className="text-white text-[9px] font-bold mt-0.5 leading-none tracking-wide">
              FREE SPIN
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
