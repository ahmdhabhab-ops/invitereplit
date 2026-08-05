import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/Logo_1769975575984.png";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background" data-testid="privacy-page">
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
                {t.privacy.backHome}
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t.privacy.title}
              </h1>
              <p className="text-muted-foreground">
                {t.privacy.lastUpdated}: {t.privacy.lastUpdatedDate}
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
                  1. {t.privacy.sections.intro.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.privacy.sections.intro.content}
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  2. {t.privacy.sections.dataCollected.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.privacy.sections.dataCollected.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {t.privacy.sections.dataCollected.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  3. {t.privacy.sections.howWeUse.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.privacy.sections.howWeUse.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {t.privacy.sections.howWeUse.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  4. {t.privacy.sections.thirdParty.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.privacy.sections.thirdParty.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {t.privacy.sections.thirdParty.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  5. {t.privacy.sections.dataSecurity.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.privacy.sections.dataSecurity.content}
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  6. {t.privacy.sections.yourRights.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.privacy.sections.yourRights.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {t.privacy.sections.yourRights.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  7. {t.privacy.sections.contact.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  {t.privacy.sections.contact.content}
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">{t.privacy.sections.contact.companyLabel}:</strong> Digicore Solutions SARL
                  </li>
                  <li>
                    <strong className="text-foreground">{t.privacy.sections.contact.emailLabel}:</strong> info@einvite.me
                  </li>
                  <li>
                    <strong className="text-foreground">{t.privacy.sections.contact.addressLabel}:</strong> Office 305, Tower 44, Dekweneh, Beirut, Lebanon
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
