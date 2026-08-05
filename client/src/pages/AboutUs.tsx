import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Building2, Calendar, MapPin, Users, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/Logo_1769975575984.png";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background" data-testid="about-page">
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
                Back to Home
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
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
                About einvite.me
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Lebanon's premier digital invitation service, transforming how people celebrate their special moments since 2020.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="prose prose-lg max-w-none"
            >
              <div className="bg-card rounded-lg p-8 border border-border mb-12">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  Our Story
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded in 2020, einvite.me was born from a simple yet powerful vision: to revolutionize 
                  the way Lebanese families and event planners share their celebrations with loved ones. 
                  What started as a passion project has grown into Lebanon's most trusted digital invitation platform.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We recognized that traditional paper invitations, while beautiful, often fell short in 
                  today's fast-paced digital world. Guests misplaced cards, RSVPs got lost, and last-minute 
                  changes were impossible to communicate. We set out to solve these challenges while 
                  preserving the elegance and personal touch that makes Lebanese celebrations so special.
                </p>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border mb-12">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-primary" />
                  Our Company
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  einvite.me operates under <strong className="text-foreground">Digicore Solutions SARL</strong>, 
                  an officially registered Lebanese company. We are proud to be a homegrown Lebanese business, 
                  contributing to the local economy and supporting Lebanese talent.
                </p>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Our Location</p>
                    <p>Office 305, Tower 44, Dekweneh, Beirut, Lebanon</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-card rounded-lg p-6 border border-border text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Since 2020</h3>
                  <p className="text-muted-foreground text-sm">5+ years serving Lebanese celebrations</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-card rounded-lg p-6 border border-border text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Nationwide Service</h3>
                  <p className="text-muted-foreground text-sm">From Tripoli to Tyre, we serve all of Lebanon</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-card rounded-lg p-6 border border-border text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Quality First</h3>
                  <p className="text-muted-foreground text-sm">Luxury designs at accessible prices</p>
                </motion.div>
              </div>

              <div className="bg-card rounded-lg p-8 border border-border mb-12">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-primary" />
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We believe every celebration deserves to be shared beautifully. Our mission is to provide 
                  Lebanese families with elegant, modern, and eco-friendly digital invitations that reflect 
                  the warmth and hospitality of our culture. We combine cutting-edge technology with 
                  artistic design to create invitations that guests will remember long after the event.
                </p>
              </div>

              <div className="text-center py-8">
                <p className="text-muted-foreground mb-6">
                  Ready to create your perfect digital invitation?
                </p>
                <Link href="/">
                  <Button size="lg" data-testid="button-get-started">
                    Get Started Today
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} einvite.me by Digicore Solutions SARL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
