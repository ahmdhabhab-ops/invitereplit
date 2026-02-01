import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sampleInvitations } from "@shared/schema";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = "weddings" | "events" | "birthdays";

export function PhoneGallery() {
  const [activeCategory, setActiveCategory] = useState<Category>("weddings");
  const [activeIndex, setActiveIndex] = useState(0);

  const samples = sampleInvitations[activeCategory];
  const activeSample = samples[activeIndex];

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as Category);
    setActiveIndex(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? samples.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === samples.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="samples" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            Sample Gallery
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our beautifully crafted digital invitations. Click to preview each design in action.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="bg-background/80 backdrop-blur-sm">
              <TabsTrigger value="weddings" className="font-medium" data-testid="tab-weddings">
                Weddings
              </TabsTrigger>
              <TabsTrigger value="events" className="font-medium" data-testid="tab-events">
                Events
              </TabsTrigger>
              <TabsTrigger value="birthdays" className="font-medium" data-testid="tab-birthdays">
                Birthdays
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Phone Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            {/* Navigation Arrows - Desktop */}
            <div className="hidden md:flex absolute left-0 right-0 top-1/2 -translate-y-1/2 justify-between pointer-events-none px-4 -mx-20 z-10">
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePrev}
                className="pointer-events-auto shadow-lg"
                data-testid="button-prev-sample"
                disabled={samples.length <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleNext}
                className="pointer-events-auto shadow-lg"
                data-testid="button-next-sample"
                disabled={samples.length <= 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Phone Frame */}
            <div className="relative mx-auto">
              {/* Outer frame */}
              <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-3xl z-20" />
                
                {/* Inner frame / Screen bezel */}
                <div className="relative bg-zinc-900 rounded-[2.5rem] overflow-hidden">
                  {/* Screen */}
                  <div className="relative w-[280px] h-[580px] sm:w-[320px] sm:h-[640px] bg-white overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeCategory}-${activeIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                      >
                        <iframe
                          src={activeSample.url}
                          title={activeSample.name}
                          className="w-full h-full border-0"
                          loading="lazy"
                          sandbox="allow-scripts allow-same-origin"
                          data-testid={`iframe-sample-${activeSample.id}`}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-600 rounded-full" />
              </div>

              {/* Reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-[3rem] pointer-events-none" />
            </div>
          </div>

          {/* Sample Name & Link */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${activeCategory}-${activeIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-8 text-center"
            >
              <h3 className="font-serif text-xl font-semibold mb-2" data-testid="text-sample-name">
                {activeSample.name}
              </h3>
              <a
                href={activeSample.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                data-testid="link-view-live"
              >
                Open in new tab
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          {samples.length > 1 && (
            <div className="flex items-center gap-2 mt-6">
              {samples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-6 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  data-testid={`dot-sample-${index}`}
                />
              ))}
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={samples.length <= 1}
              data-testid="button-prev-sample-mobile"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={samples.length <= 1}
              data-testid="button-next-sample-mobile"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}