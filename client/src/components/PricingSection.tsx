import { motion } from "framer-motion";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface PricingSectionProps {
  onSelectPackage: (packageId: string) => void;
}

export function PricingSection({ onSelectPackage }: PricingSectionProps) {
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });
  const { t } = useLanguage();

  const pricingTiers = [
    {
      id: "essential",
      name: t.pricing.plans.essential.name,
      price: settings?.essentialPrice ?? 49,
      description: t.pricing.plans.essential.description,
      features: settings?.essentialFeatures ?? t.pricing.plans.essential.features,
    },
    {
      id: "premium",
      name: t.pricing.plans.premium.name,
      price: settings?.premiumPrice ?? 99,
      description: t.pricing.plans.premium.description,
      features: settings?.premiumFeatures ?? t.pricing.plans.premium.features,
      popular: true,
    },
    {
      id: "royal",
      name: t.pricing.plans.royal.name,
      price: settings?.royalPrice ?? 199,
      description: t.pricing.plans.royal.description,
      features: settings?.royalFeatures ?? t.pricing.plans.royal.features,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-muted/30">
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
            {t.pricing.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Pricing Cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => {
              const isPopular = "popular" in tier && tier.popular;
              
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative ${isPopular ? "md:-mt-4 md:mb-4" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t.pricing.mostPopular}
                      </Badge>
                    </div>
                  )}
                  
                  <Card
                    className={`h-full flex flex-col ${
                      isPopular
                        ? "border-primary/50 bg-card shadow-lg shadow-primary/10"
                        : "bg-card"
                    }`}
                  >
                    <CardHeader className="text-center pb-4">
                      <h3 className="font-serif text-2xl font-semibold">{tier.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{tier.description}</p>
                      <div className="mt-4">
                        <span className="font-serif text-4xl font-semibold" data-testid={`price-${tier.id}`}>${tier.price}</span>
                        <span className="text-muted-foreground text-sm ml-1">{t.pricing.oneTime}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter>
                      <Button
                        className="w-full font-medium"
                        variant={isPopular ? "default" : "outline"}
                        onClick={() => onSelectPackage(tier.id)}
                        data-testid={`button-select-${tier.id}`}
                      >
                        {t.pricing.selectPackage}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12 mt-16 pt-8 border-t border-border/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm">{t.pricing.trust.securePayment}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm">{t.pricing.trust.fastDelivery}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm">{t.pricing.trust.satisfaction}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
