import { motion } from "framer-motion";
import { Play } from "lucide-react";

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
            <iframe
              src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2F61562775291878%2Fvideos%2F1248730203593712%2F&show_text=false&width=560&t=0"
              width="560"
              height="314"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="rounded-lg max-w-full"
              data-testid="promo-video-iframe"
            />
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
