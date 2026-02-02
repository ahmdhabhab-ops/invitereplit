import { motion } from "framer-motion";
import { Play } from "lucide-react";
import promoVideo from "@assets/AQOWSCYZqd_AOpGXrLIJf90CHlkdcoONDBN_-tAPQ5MZxWPh8SgEdzkW1fk3mH_1770007142069.mp4";

export function PromoVideo() {
  return (
    <section className="py-20 bg-secondary/30" data-testid="promo-video-section">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Play className="w-4 h-4" />
            Watch Our Story
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            See Our Wedding Invitations in Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover how einvite.me transforms your special day with elegant digital invitations 
            that capture the magic of Lebanese weddings.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-xl overflow-hidden shadow-2xl bg-card border border-border"
        >
          <div className="flex justify-center py-8">
            <video
              src={promoVideo}
              controls
              className="rounded-lg max-w-full w-full max-h-[500px]"
              data-testid="promo-video"
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-muted-foreground mt-6 text-sm"
        >
          Join hundreds of Lebanese couples who chose einvite.me for their wedding day
        </motion.p>
      </div>
    </section>
  );
}
