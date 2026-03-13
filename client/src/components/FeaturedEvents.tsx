import { motion } from "framer-motion";
import { Calendar, MapPin, Leaf, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

import youthForumImage from "@assets/469559969_122127799898425843_3373933668895682627_n_1769975983264.jpg";
import webSummitImage1 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(1)_1769976351430.jpeg";
import webSummitImage2 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(2)_1769976351430.jpeg";
import webSummitImage3 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(6)_1769976351431.jpeg";
import webSummitImage4 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(7)_1769976351431.jpeg";

const eventIcons = [Leaf, Globe];
const eventImages = [
  [youthForumImage],
  [webSummitImage1, webSummitImage2, webSummitImage3, webSummitImage4],
];
const eventIds = ["youth-forum", "web-summit"];

export function FeaturedEvents() {
  const { t } = useLanguage();
  const tf = t.featuredEvents;

  return (
    <section className="py-20 bg-secondary/30" data-testid="section-featured-events">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {tf.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {tf.subtitle}
          </p>
        </motion.div>

        <div className="space-y-16">
          {tf.events.map((event, index) => {
            const Icon = eventIcons[index];
            const images = eventImages[index];
            const id = eventIds[index];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg" data-testid={`card-event-${id}`}>
                  <CardContent className="p-0">
                    <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                      <div className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <div className="flex items-center gap-2 text-primary mb-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium uppercase tracking-wider">{tf.featuredLabel}</span>
                        </div>

                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
                          {event.title}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {event.description}
                        </p>

                        <p className="text-primary font-medium mb-4">
                          {event.highlight}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                        {images.length === 1 ? (
                          <img
                            src={images[0]}
                            alt={event.title}
                            className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
                          />
                        ) : (
                          <div className="grid grid-cols-2 gap-1 h-full min-h-[300px] md:min-h-[400px]">
                            {images.slice(0, 4).map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={image}
                                alt={`${event.title} ${imgIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
