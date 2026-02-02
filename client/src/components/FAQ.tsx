import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does it take to get my digital invite in Lebanon?",
    answer: "Most digital invitations are ready within 24-48 hours after you submit your order and provide all the necessary details. For rush orders, we offer express delivery within 12 hours for an additional fee."
  },
  {
    question: "Can I include a location map for my venue in Beirut?",
    answer: "Absolutely! All our digital invitations come with integrated Google Maps functionality. Whether your venue is in Beirut, Jounieh, Byblos, or anywhere else in Lebanon, guests can get directions with a single tap."
  },
  {
    question: "What languages do you support for invitations?",
    answer: "We fully support Arabic, English, and French—the three main languages used in Lebanon. You can have your invitation in one language or combine multiple languages to accommodate all your guests."
  },
  {
    question: "How do guests RSVP to my digital invitation?",
    answer: "Guests simply tap the RSVP button on their invitation and select their attendance status. You'll receive real-time notifications and can track all responses from your personal dashboard."
  },
  {
    question: "Can I update my invitation after it's been sent?",
    answer: "Yes! One of the biggest advantages of digital invitations is the ability to make updates. Whether you need to change the venue, time, or any other details, changes are reflected instantly for all guests."
  },
  {
    question: "Do you serve areas outside Beirut?",
    answer: "We proudly serve all of Lebanon—from Tripoli in the north to Tyre in the south, and from the coastal cities to the Bekaa Valley and mountain regions. No matter where your event is, we've got you covered."
  },
  {
    question: "What's included in each pricing package?",
    answer: "Our Essential package ($49) includes a beautiful digital invitation with RSVP tracking. Premium ($99) adds custom animations, music, and a photo gallery. Royal ($199) offers unlimited customization, video integration, and priority support."
  },
  {
    question: "How do I share my digital invitation with guests?",
    answer: "You'll receive a unique link that can be shared via WhatsApp, SMS, email, or any social media platform. Guests don't need to download any app—they simply tap the link to view your invitation."
  },
  {
    question: "Are digital invitations environmentally friendly?",
    answer: "Yes! Digital invitations eliminate the need for paper, printing, and physical delivery, making them an eco-friendly choice. You'll save trees while still creating a luxurious experience for your guests."
  },
  {
    question: "Can I see samples before ordering?",
    answer: "Of course! Browse our sample gallery on the homepage to see examples of wedding, birthday, and event invitations. Each sample showcases the interactive features and elegant designs available."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-20 bg-background" data-testid="faq-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about our digital invitation service in Lebanon
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="border border-border rounded-lg overflow-hidden"
              data-testid={`faq-item-${index}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-card hover-elevate transition-colors"
                aria-expanded={openIndex === index}
                data-testid={`faq-button-${index}`}
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
