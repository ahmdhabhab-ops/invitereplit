import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Heart, Star } from "lucide-react";
import Lottie from "lottie-react";

// Simple envelope opening animation data
const envelopeAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Envelope",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [80, 80, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [90, 90, 100] },
          { t: 90, s: [80, 80, 100] }
        ]}
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [80, 50] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
            { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 0.2] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 10] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "sh", ks: { a: 1, k: [
              { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [{ c: true, v: [[-40, -15], [0, 10], [40, -15]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }] },
              { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 45, s: [{ c: true, v: [[-40, -15], [0, -30], [40, -15]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }] },
              { t: 90, s: [{ c: true, v: [[-40, -15], [0, 10], [40, -15]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }] }
            ]}},
            { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 0.3] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    }
  ]
};

// Simple sparkle animation data
const sparkleAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Sparkle",
      sr: 1,
      ks: {
        o: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [30] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [100] },
          { t: 60, s: [30] }
        ]},
        r: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0] },
          { t: 60, s: [180] }
        ]},
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [80, 80, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [100, 100, 100] },
          { t: 60, s: [80, 80, 100] }
        ]}
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 8 }, is: { a: 0, k: 0 }, or: { a: 0, k: 20 }, os: { a: 0, k: 0 } },
            { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    }
  ]
};

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.5 }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Floating decorative Lottie elements */}
      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-24 right-[12%] opacity-60 hidden md:block"
      >
        <Lottie animationData={envelopeAnimation} loop={true} className="w-24 h-24" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-40 left-[12%] opacity-50 hidden md:block"
      >
        <Lottie animationData={sparkleAnimation} loop={true} className="w-16 h-16" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 left-[8%] opacity-40 hidden lg:block"
      >
        <Lottie animationData={sparkleAnimation} loop={true} className="w-12 h-12" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 12, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-[8%] opacity-50 hidden lg:block"
      >
        <Lottie animationData={envelopeAnimation} loop={true} className="w-20 h-20" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Premium Digital Invitations</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6">
            Create <span className="text-primary">Unforgettable</span>
            <br />
            Moments Together
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Beautiful, interactive digital invitations for your weddings, events, and celebrations. 
            Share your special moments with elegance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => scrollToSection("pricing")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base"
              data-testid="button-hero-get-started"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("samples")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base"
              data-testid="button-hero-view-samples"
            >
              View Samples
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-border/50"
        >
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-primary">500+</div>
            <div className="text-sm text-muted-foreground mt-1">Happy Couples</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-primary">1000+</div>
            <div className="text-sm text-muted-foreground mt-1">Events Created</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-primary">4.9</div>
            <div className="text-sm text-muted-foreground mt-1">Customer Rating</div>
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
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}