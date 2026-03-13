import { motion } from "framer-motion";
import { MapPin, Users, Leaf, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const featureIcons = [Users, MapPin, Leaf, Languages];

export function WhyChooseUs() {
  const { t } = useLanguage();
  const tf = t.whyChooseUs;

  return (
    <section className="py-20 bg-secondary/30" data-testid="why-choose-us-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {tf.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            {tf.subtitle}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          {tf.subtitle2}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-foreground font-medium mb-10 max-w-3xl mx-auto"
        >
          {tf.subtitle3}
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tf.features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-card rounded-lg p-6 text-center border border-border/50"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-muted-foreground max-w-3xl mx-auto italic"
        >
          {tf.caption}
        </motion.p>
      </div>
    </section>
  );
}
