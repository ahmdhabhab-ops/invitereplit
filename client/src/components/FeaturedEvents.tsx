import { motion } from "framer-motion";
import { Calendar, MapPin, Leaf, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import youthForumImage from "@assets/469559969_122127799898425843_3373933668895682627_n_1769975983264.jpg";
import webSummitImage1 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(1)_1769976351430.jpeg";
import webSummitImage2 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(2)_1769976351430.jpeg";
import webSummitImage3 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(6)_1769976351431.jpeg";
import webSummitImage4 from "@assets/WhatsApp_Image_2026-02-01_at_22.03.27_(7)_1769976351431.jpeg";

const events = [
  {
    id: "youth-forum",
    title: "National Youth Leadership Forum",
    location: "LAU Byblos, Lebanon",
    date: "September 9th, 2024",
    description: "Einvite participated in the National Youth Leadership Forum organized by UNDP and LAU, celebrating 10 years of the Youth Leadership Programme. We showcased our eco-friendly digital invitation solutions, helping make events greener and more efficient!",
    highlight: "Fostering innovation and sustainable growth",
    icon: Leaf,
    images: [youthForumImage],
    tags: ["EcoFriendly", "SustainableEvents", "YouthLeadership"],
  },
  {
    id: "web-summit",
    title: "Web Summit Qatar 2025",
    location: "Doha, Qatar",
    date: "2025",
    description: "Einvite proudly exhibited at Web Summit Qatar 2025, one of the world's largest technology conferences. We showcased our innovative event management platform featuring e-commerce for gifting, crowdfunding, ticketing, and secure contacts via Blockchain.",
    highlight: "Booth A225 - ALPHA Stage",
    icon: Globe,
    images: [webSummitImage1, webSummitImage2, webSummitImage3, webSummitImage4],
    tags: ["WebSummitQatar", "TechStartup", "Innovation"],
  },
];

export function FeaturedEvents() {
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
            Where We've Been
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connecting with communities and showcasing sustainable event solutions at leading conferences and forums
          </p>
        </motion.div>

        <div className="space-y-16">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg" data-testid={`card-event-${event.id}`}>
                <CardContent className="p-0">
                  <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                    <div className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                      <div className="flex items-center gap-2 text-primary mb-3">
                        <event.icon className="w-5 h-5" />
                        <span className="text-sm font-medium uppercase tracking-wider">Featured Event</span>
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
                      {event.images.length === 1 ? (
                        <img
                          src={event.images[0]}
                          alt={event.title}
                          className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-1 h-full min-h-[300px] md:min-h-[400px]">
                          {event.images.slice(0, 4).map((image, imgIndex) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
