import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import { SiInstagram, SiFacebook, SiWhatsapp, SiTiktok, SiLinkedin } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import logoImage from "@assets/Logo_1769975575984.png";
import type { SiteSettings } from "@shared/schema";

export function Footer() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const whatsappNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, "") || "96181824782";

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="inline-block mb-4" data-testid="link-footer-logo">
              <img 
                src={logoImage} 
                alt="Einvite.me" 
                className="h-8 w-auto"
              />
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Creating beautiful digital invitations for your special moments. 
              Elegant, interactive, and memorable.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  data-testid="link-instagram"
                >
                  <SiInstagram className="w-5 h-5" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  data-testid="link-facebook"
                >
                  <SiFacebook className="w-5 h-5" />
                </a>
              )}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="w-5 h-5" />
              </a>
              {settings?.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  data-testid="link-linkedin"
                >
                  <SiLinkedin className="w-5 h-5" />
                </a>
              )}
              {settings?.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  data-testid="link-tiktok"
                >
                  <SiTiktok className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("samples")}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  data-testid="link-footer-samples"
                >
                  Sample Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  data-testid="link-footer-how-it-works"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  data-testid="link-footer-pricing"
                >
                  Pricing
                </button>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  data-testid="link-footer-about"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-muted-foreground text-sm">Wedding Invitations</span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Event Invitations</span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Birthday Invitations</span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Custom Designs</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{settings?.email || "info@einvite.me"}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{settings?.phoneNumber || "+961 81 82 47 82"}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Beirut, Lebanon</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} einvite.me. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> in Lebanon
          </p>
        </div>
      </div>
    </footer>
  );
}
