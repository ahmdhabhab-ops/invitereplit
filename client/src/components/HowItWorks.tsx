import { motion } from "framer-motion";
import { Package, FileEdit, Eye, Rocket } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Pick a Plan",
    description: "Choose the perfect package that fits your celebration style and budget.",
  },
  {
    icon: FileEdit,
    title: "Fill the Form",
    description: "Share your event details, photos, and preferences with our easy form.",
  },
  {
    icon: Eye,
    title: "Design Review",
    description: "Our designers craft your invitation. Review and request revisions.",
  },
  {
    icon: Rocket,
    title: "Go Live",
    description: "Your stunning invitation is ready to share with friends and family.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to create your perfect digital invitation
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {/* Step Number & Icon */}
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px] mx-auto">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-6 sm:hidden">
                    <div className="w-0.5 h-8 bg-primary/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}