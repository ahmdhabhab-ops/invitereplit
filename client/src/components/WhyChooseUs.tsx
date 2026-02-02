import { motion } from "framer-motion";
import { MapPin, Users, Leaf, Languages } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-Time RSVP Tracking",
    description: "Know exactly who is coming with one click."
  },
  {
    icon: MapPin,
    title: "Instant Location Sharing",
    description: "Integrated Google Maps for any venue in Lebanon."
  },
  {
    icon: Leaf,
    title: "Eco-Friendly & Cost-Effective",
    description: "Save on printing and delivery while maintaining a high-end feel."
  },
  {
    icon: Languages,
    title: "Cultural Customization",
    description: "Fully supports Arabic, English, and French designs to suit your family's needs."
  }
];

export function WhyChooseUs() {
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
            The Premier Digital Invitation Service Across All of Lebanon
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Whether you are planning a grand gala in Beirut, a seaside wedding in Jounieh or Byblos, 
            or a mountain celebration in the Chouf and North Lebanon, einvite.me offers the most 
            elegant and professional way to invite your guests.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          We proudly serve every village and city across Lebanon—from Tripoli to Tyre, 
          and from the Metn to the Bekaa Valley.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-foreground font-medium mb-10 max-w-3xl mx-auto"
        >
          Unlike traditional paper cards, our digital invites provide a luxury experience 
          that fits the modern Lebanese lifestyle:
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-card rounded-lg p-6 text-center border border-border/50"
              data-testid={`feature-card-${index}`}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-muted-foreground max-w-3xl mx-auto italic"
        >
          Join hundreds of couples and event planners nationwide who have chosen the most 
          sophisticated and sustainable invitation solution in the Middle East.
        </motion.p>
      </div>
    </section>
  );
}
