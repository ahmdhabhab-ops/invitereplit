import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Heart, Star, Send, Gift } from "lucide-react";

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50" />
      
      {/* Decorative gradient shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-300/40 to-pink-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-violet-300/30 to-indigo-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-200/40 to-purple-200/30 rounded-full blur-2xl"
        />
      </div>

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-28 right-[18%] hidden md:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-purple-200/50 flex items-center justify-center border border-purple-100">
          <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-36 left-[12%] hidden md:block"
      >
        <div className="w-14 h-14 rounded-xl bg-white shadow-xl shadow-violet-200/50 flex items-center justify-center border border-violet-100">
          <Send className="w-6 h-6 text-violet-500" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[6%] hidden lg:block"
      >
        <div className="w-12 h-12 rounded-lg bg-white shadow-lg shadow-yellow-200/50 flex items-center justify-center border border-yellow-100">
          <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-[8%] hidden lg:block"
      >
        <div className="w-14 h-14 rounded-xl bg-white shadow-xl shadow-purple-200/50 flex items-center justify-center border border-purple-100">
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-[15%] hidden xl:block"
      >
        <div className="w-12 h-12 rounded-lg bg-white shadow-lg shadow-pink-200/50 flex items-center justify-center border border-pink-100">
          <Gift className="w-5 h-5 text-pink-500" />
        </div>
      </motion.div>

      {/* Decorative invitation card */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-2, 4, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-[6%] hidden xl:block"
      >
        <div className="w-36 h-48 rounded-xl bg-white shadow-2xl shadow-purple-300/30 p-4 transform rotate-6 border border-purple-100">
          <div className="w-full h-full rounded-lg border-2 border-dashed border-purple-200 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-purple-50 to-pink-50">
            <Heart className="w-8 h-8 text-purple-400" fill="currentColor" />
            <div className="w-16 h-1.5 bg-purple-300 rounded-full" />
            <div className="w-12 h-1 bg-purple-200 rounded-full" />
            <div className="w-14 h-1 bg-purple-200 rounded-full" />
            <div className="w-10 h-1 bg-purple-100 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Floating dots */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${8 + (i * 6)}%`,
            top: `${20 + (i % 4) * 20}%`,
            backgroundColor: i % 3 === 0 ? '#c4b5fd' : i % 3 === 1 ? '#f9a8d4' : '#a5b4fc',
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.15,
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md shadow-purple-100 border border-purple-100 mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">#1 Digital Invitations in Lebanon</span>
          </motion.div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6 text-gray-900">
            Transform Your
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-violet-600 bg-clip-text text-transparent">
              Celebrations
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Beautiful, interactive digital invitations for your weddings, events, and celebrations. 
            Share your special moments with elegance and style.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => scrollToSection("pricing")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-300/40"
              data-testid="button-hero-get-started"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("samples")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base border-purple-200 text-purple-700 hover:bg-purple-50 bg-white shadow-md"
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
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-purple-100"
        >
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">500+</div>
            <div className="text-sm text-gray-500 mt-1">Happy Couples</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">1000+</div>
            <div className="text-sm text-gray-500 mt-1">Events Created</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">4.9</div>
            <div className="text-sm text-gray-500 mt-1">Customer Rating</div>
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
          className="w-6 h-10 border-2 border-purple-300 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-2.5 bg-purple-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
