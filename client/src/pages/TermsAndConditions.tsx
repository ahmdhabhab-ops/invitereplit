import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/Logo_1769975575984.png";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsAndConditions() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background" data-testid="terms-page">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img
                src={logoImage}
                alt="Einvite.me"
                className="h-8 w-auto cursor-pointer"
                data-testid="link-logo"
              />
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.terms.backHome}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t.terms.title}
              </h1>
              <p className="text-muted-foreground">
                {t.terms.lastUpdated}: {t.terms.lastUpdatedDate}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  1. {t.terms.sections.acceptance.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.acceptance.content}
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  2. {t.terms.sections.service.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.terms.sections.service.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {t.terms.sections.service.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border border-l-4 border-l-destructive">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  3. {t.terms.sections.payment.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.terms.sections.payment.content}
                </p>
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-foreground mb-2">
                    {t.terms.sections.payment.noRefundTitle}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.terms.sections.payment.noRefundContent}
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t.terms.sections.payment.depositNote}
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  4. {t.terms.sections.ip.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.ip.content}
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  5. {t.terms.sections.userContent.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.userContent.content}
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  6. {t.terms.sections.liability.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.liability.content}
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  7. {t.terms.sections.contact.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  {t.terms.sections.contact.content}
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">{t.terms.sections.contact.companyLabel}:</strong> Digicore Solutions SARL
                  </li>
                  <li>
                    <strong className="text-foreground">{t.terms.sections.contact.emailLabel}:</strong> info@einvite.me
                  </li>
                  <li>
                    <strong className="text-foreground">{t.terms.sections.contact.addressLabel}:</strong> Office 305, Tower 44, Dekweneh, Beirut, Lebanon
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} einvite.me by Digicore Solutions SARL. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
