import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Heart, MapPin, Users, Clock, Sparkles, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@assets/Logo_1769975575984.png";

const features = [
  {
    icon: Heart,
    title: "Elegant Lebanese Designs",
    description: "Beautiful templates inspired by Lebanese wedding traditions, featuring Arabic calligraphy and modern aesthetics."
  },
  {
    icon: MapPin,
    title: "Venue Maps for Any Location",
    description: "Integrated Google Maps for wedding venues across Lebanon - from Beirut hotels to mountain resorts in Faraya and seaside venues in Byblos."
  },
  {
    icon: Users,
    title: "Smart RSVP Management",
    description: "Track guest responses in real-time. Know exactly who's attending your wedding with one-click confirmations."
  },
  {
    icon: Clock,
    title: "24-Hour Delivery",
    description: "Receive your custom wedding invitation within 24 hours. Rush delivery available for last-minute celebrations."
  },
  {
    icon: Globe,
    title: "Trilingual Support",
    description: "Full support for Arabic, English, and French - perfect for Lebanese families with international guests."
  },
  {
    icon: Sparkles,
    title: "Stunning Animations",
    description: "Captivate your guests with elegant animations, music, and interactive elements that make your invitation memorable."
  }
];

const venues = [
  "Beirut", "Jounieh", "Byblos", "Batroun", "Tripoli", "Sidon", "Tyre",
  "Faraya", "Broummana", "Aley", "Beiteddine", "Baalbek", "Zahle", "Chouf"
];

export default function WeddingInvitationsLebanon() {
  return (
    <div className="min-h-screen bg-background" data-testid="wedding-page">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img 
                src={logoImage} 
                alt="Einvite.me - Digital Wedding Invitations Lebanon" 
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
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Digital Wedding Invitations in Lebanon
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Create stunning, personalized wedding invitations for your special day. 
                Trusted by hundreds of Lebanese couples from Beirut to Tripoli.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/#pricing">
                  <Button size="lg" data-testid="button-get-started">
                    <Heart className="w-5 h-5 mr-2" />
                    Create Your Invitation
                  </Button>
                </Link>
                <Link href="/#samples">
                  <Button size="lg" variant="outline" data-testid="button-view-samples">
                    View Wedding Samples
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Lebanese Couples Choose einvite.me
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The most elegant and professional way to invite guests to your Lebanese wedding
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Serving Weddings Across All of Lebanon
              </h2>
              <p className="text-muted-foreground text-lg">
                From mountain weddings to seaside celebrations, we create invitations for every Lebanese venue
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3">
              {venues.map((venue, index) => (
                <motion.span
                  key={venue}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground"
                >
                  {venue}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 md:p-12 text-center">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                  What's Included in Your Wedding Invitation
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mt-8">
                  {[
                    "Custom design matching your wedding theme",
                    "Arabic, English, and French text support",
                    "Interactive Google Maps to your venue",
                    "Real-time RSVP tracking dashboard",
                    "Background music of your choice",
                    "Photo gallery of your engagement",
                    "Countdown timer to your big day",
                    "Unlimited revisions until you're happy",
                    "WhatsApp sharing optimization",
                    "Mobile-friendly responsive design"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-10">
                  <Link href="/#pricing">
                    <Button size="lg" data-testid="button-view-pricing">
                      View Pricing & Get Started
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                Ready to Create Your Perfect Wedding Invitation?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join hundreds of Lebanese couples who trusted einvite.me for their special day.
                Get your beautiful digital invitation delivered within 24 hours.
              </p>
              <Link href="/#pricing">
                <Button size="lg" data-testid="button-start-now">
                  Start Now - From $49
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} einvite.me - Lebanon's #1 Digital Wedding Invitation Service
          </p>
        </div>
      </footer>
    </div>
  );
}
