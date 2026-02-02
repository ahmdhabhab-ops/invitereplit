import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Cake, PartyPopper, Calendar, MapPin, Users, Clock, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@assets/Logo_1769975575984.png";

const eventTypes = [
  {
    icon: Cake,
    title: "Birthday Parties",
    description: "From kids' birthday celebrations to milestone adult birthdays - create invitations that set the perfect tone."
  },
  {
    icon: PartyPopper,
    title: "Corporate Events",
    description: "Professional digital invitations for company gatherings, product launches, and business celebrations in Lebanon."
  },
  {
    icon: Calendar,
    title: "Graduation Parties",
    description: "Celebrate academic achievements with elegant invitations for graduation ceremonies and parties."
  },
  {
    icon: Users,
    title: "Baby Showers",
    description: "Adorable designs for baby showers and gender reveal parties that your guests will love."
  },
  {
    icon: Sparkles,
    title: "Engagement Parties",
    description: "Announce your engagement in style with beautiful digital invitations for your celebration."
  },
  {
    icon: MapPin,
    title: "Private Gatherings",
    description: "Intimate dinner parties, reunions, and special occasions deserve special invitations."
  }
];

const features = [
  "Custom themes matching your event style",
  "Arabic, English, and French support",
  "Interactive venue location maps",
  "Real-time RSVP tracking",
  "Music and animation options",
  "Photo gallery integration",
  "Countdown timer to your event",
  "Easy WhatsApp sharing",
  "Mobile-optimized design",
  "24-hour delivery available"
];

export default function BirthdayEventInvites() {
  return (
    <div className="min-h-screen bg-background" data-testid="birthday-events-page">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img 
                src={logoImage} 
                alt="Einvite.me - Birthday & Event Invitations Lebanon" 
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
                Birthday & Event Digital Invitations in Lebanon
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Create memorable invitations for birthdays, corporate events, and special celebrations. 
                Professional designs delivered fast across Lebanon.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/#pricing">
                  <Button size="lg" data-testid="button-get-started">
                    <PartyPopper className="w-5 h-5 mr-2" />
                    Create Your Invitation
                  </Button>
                </Link>
                <Link href="/#samples">
                  <Button size="lg" variant="outline" data-testid="button-view-samples">
                    View Event Samples
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
                Digital Invitations for Every Occasion
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Whether it's a child's birthday or a corporate gala, we have the perfect design for you
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventTypes.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <event.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                    <p className="text-muted-foreground text-sm">{event.description}</p>
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
            >
              <Card className="p-8 md:p-12">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">
                  Everything You Need for a Perfect Invitation
                </h2>
                <p className="text-muted-foreground text-center mb-8">
                  Our event invitations come packed with features to make your celebration unforgettable
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {features.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
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
              className="text-center"
            >
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                Why Go Digital for Your Event?
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mt-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Save Time</h3>
                  <p className="text-muted-foreground text-sm">
                    No printing delays or postal services. Share instantly via WhatsApp.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Track RSVPs</h3>
                  <p className="text-muted-foreground text-sm">
                    Know exactly who's coming with real-time response tracking.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Impress Guests</h3>
                  <p className="text-muted-foreground text-sm">
                    Interactive animations and music create a memorable first impression.
                  </p>
                </div>
              </div>
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
                Ready to Create Your Event Invitation?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                From birthday parties to corporate events, get your beautiful digital invitation 
                delivered within 24 hours. Starting at just $49.
              </p>
              <Link href="/#pricing">
                <Button size="lg" data-testid="button-start-now">
                  Get Started Today
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} einvite.me - Digital Event Invitations in Lebanon
          </p>
        </div>
      </footer>
    </div>
  );
}
