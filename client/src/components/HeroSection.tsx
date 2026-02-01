import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Heart, Star, Send } from "lucide-react";

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          x: [0, 15, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[15%] w-64 h-64 bg-gradient-to-br from-purple-500/40 to-pink-500/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          x: [0, -10, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[10%] w-80 h-80 bg-gradient-to-br from-violet-600/30 to-indigo-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          y: [0, -15, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-[5%] w-40 h-40 bg-gradient-to-br from-pink-500/25 to-purple-500/20 rounded-full blur-2xl"
      />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[20%] hidden md:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
          <Heart className="w-8 h-8 text-pink-400" fill="currentColor" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-[15%] hidden md:block"
      >
        <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
          <Send className="w-6 h-6 text-violet-300" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[8%] hidden lg:block"
      >
        <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
          <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/3 right-[10%] hidden lg:block"
      >
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
          <Sparkles className="w-10 h-10 text-purple-300" />
        </div>
      </motion.div>

      {/* Decorative invitation card */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-[8%] hidden xl:block"
      >
        <div className="w-32 h-44 rounded-xl bg-white/90 shadow-2xl p-3 transform rotate-6">
          <div className="w-full h-full rounded-lg border-2 border-purple-200 flex flex-col items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-purple-500" fill="currentColor" />
            <div className="w-16 h-1 bg-purple-300 rounded" />
            <div className="w-12 h-1 bg-purple-200 rounded" />
            <div className="w-14 h-1 bg-purple-200 rounded" />
          </div>
        </div>
      </motion.div>

      {/* Particle dots */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/40 rounded-full"
          style={{
            left: `${10 + (i * 4.5)}%`,
            top: `${15 + (i % 5) * 18}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-medium text-white/90">Premium Digital Invitations</span>
          </motion.div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6 text-white">
            Transform Your
            <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
              Celebrations
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Beautiful, interactive digital invitations for your weddings, events, and celebrations. 
            Share your special moments with elegance and style.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => scrollToSection("pricing")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base bg-white text-purple-900 hover:bg-white/90"
              data-testid="button-hero-get-started"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("samples")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base border-white/30 text-white hover:bg-white/10 bg-white/5"
              data-testid="button-hero-view-samples"
            >
              View Samples
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-white/10"
        >
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-white">500+</div>
            <div className="text-sm text-white/60 mt-1">Happy Couples</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-white">1000+</div>
            <div className="text-sm text-white/60 mt-1">Events Created</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-white">4.9</div>
            <div className="text-sm text-white/60 mt-1">Customer Rating</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-2.5 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
