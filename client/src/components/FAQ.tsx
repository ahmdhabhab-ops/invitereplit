import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

export function FAQ() {
  const { t, formatPrice } = useLanguage();
  const { data: settings } = useQuery<SiteSettings>({ queryKey: ["/api/settings"] });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Same source and fallbacks as PricingSection, so the FAQ always quotes the prices shown on the cards.
  const prices: Record<string, string> = {
    essential: formatPrice(settings?.essentialPrice ?? 49),
    premium: formatPrice(settings?.premiumPrice ?? 99),
    royal: formatPrice(settings?.royalPrice ?? 199),
  };
  const tf = {
    ...t.faq,
    items: t.faq.items.map((item) => ({
      ...item,
      answer: item.answer.replace(/\{(essential|premium|royal)\}/g, (_, plan: string) => prices[plan]),
    })),
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tf.items.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-20 bg-background" data-testid="faq-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto px-4 max-w-3xl">
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
          <p className="text-muted-foreground text-lg">
            {tf.subtitle}
          </p>
        </motion.div>

        <div className="space-y-4">
          {tf.items.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="border border-border rounded-lg overflow-hidden"
              data-testid={`faq-item-${index}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-card hover-elevate transition-colors"
                aria-expanded={openIndex === index}
                data-testid={`faq-button-${index}`}
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
