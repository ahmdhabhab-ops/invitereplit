import { motion } from "framer-motion";
import { Package, FileEdit, Eye, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Pick a Plan",
    description: "Choose the perfect package that fits your celebration style and budget. We offer Essential, Premium, and Royal tiers.",
    icon: Package,
    color: "from-violet-500 to-purple-600",
  },
  {
    number: "02",
    title: "Fill the Form",
    description: "Share your event details, photos, song preferences, and locations using our simple order form.",
    icon: FileEdit,
    color: "from-purple-500 to-indigo-600",
  },
  {
    number: "03",
    title: "Design Review",
    description: "Our designers craft your unique invitation. You'll review the design and can request revisions.",
    icon: Eye,
    color: "from-indigo-500 to-violet-600",
  },
  {
    number: "04",
    title: "Go Live",
    description: "Your stunning digital invitation is ready to share with friends and family via WhatsApp or link.",
    icon: Rocket,
    color: "from-purple-600 to-pink-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Simple Process
          </motion.span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to create your perfect digital invitation
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-32 left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 h-full hover-elevate transition-all duration-300">
                    <div className="relative mx-auto mb-6 flex justify-center">
                      <motion.div 
                        className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -5, 0],
                            rotate: index === 3 ? [0, 5, 0] : 0
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: index * 0.2
                          }}
                        >
                          <IconComponent className="w-10 h-10 text-white" strokeWidth={1.5} />
                        </motion.div>
                      </motion.div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">{step.number}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-32 -right-3 z-10">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </motion.div>
                    </div>
                  )}

                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-4 sm:hidden">
                      <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
