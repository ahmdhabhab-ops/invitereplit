import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/Logo_1769975575984.png";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    const next: Language = language === "en" ? "fr" : "en";
    setLanguage(next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center"
            data-testid="link-logo"
          >
            <img 
              src={logoImage} 
              alt="Einvite.me" 
              className="h-8 md:h-10 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" data-testid="nav-desktop">
            <button
              onClick={() => scrollToSection("samples")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-samples"
            >
              {t.nav.samples}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-how-it-works"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-pricing"
            >
              {t.nav.pricing}
            </button>
            <a
              href="/event-planners"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              data-testid="link-event-planners"
            >
              {t.nav.eventPlanners}
            </a>
            <a
              href="/careers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-careers"
            >
              {t.nav.careers}
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="font-semibold text-xs px-3 py-1 h-8 border-primary/30 text-primary hover:bg-primary/10"
              data-testid="button-language-toggle"
            >
              {t.langToggle}
            </Button>
            <a
              href="https://build.einvite.me/login"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-login"
            >
              <Button variant="outline" className="font-medium">
                {t.nav.login}
              </Button>
            </a>
            <Button
              onClick={() => scrollToSection("pricing")}
              className="font-medium"
              data-testid="button-get-started"
            >
              {t.nav.getStarted}
            </Button>
          </nav>

          {/* Mobile: language toggle + menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="font-semibold text-xs px-3 py-1 h-8 border-primary/30 text-primary hover:bg-primary/10"
              data-testid="button-language-toggle-mobile"
            >
              {t.langToggle}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
            data-testid="nav-mobile"
          >
            <nav className="flex flex-col gap-2 p-4">
              <button
                onClick={() => scrollToSection("samples")}
                className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                data-testid="link-samples-mobile"
              >
                {t.nav.samples}
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                data-testid="link-how-it-works-mobile"
              >
                {t.nav.howItWorks}
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                data-testid="link-pricing-mobile"
              >
                {t.nav.pricing}
              </button>
              <a
                href="/event-planners"
                className="text-left py-3 px-4 text-sm font-medium text-primary hover:bg-muted rounded-md transition-colors"
                data-testid="link-event-planners-mobile"
              >
                {t.nav.eventPlanners}
              </a>
              <a
                href="/careers"
                className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                data-testid="link-careers-mobile"
              >
                {t.nav.careers}
              </a>
              <a
                href="https://build.einvite.me/login"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-login-mobile"
                className="w-full"
              >
                <Button variant="outline" className="w-full mt-2 font-medium">
                  {t.nav.login}
                </Button>
              </a>
              <Button
                onClick={() => scrollToSection("pricing")}
                className="mt-2 font-medium"
                data-testid="button-get-started-mobile"
              >
                {t.nav.getStarted}
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
