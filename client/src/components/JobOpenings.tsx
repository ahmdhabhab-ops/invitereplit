import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Building2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { JobOpening } from "@shared/schema";

const MAX_JOBS_ON_HOME = 3;

export function JobOpenings() {
  const { t } = useLanguage();
  const tc = t.careers;
  const { data: jobs = [] } = useQuery<JobOpening[]>({ queryKey: ["/api/jobs"] });

  if (jobs.length === 0) return null;

  return (
    <section id="careers" className="py-20 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {tc.heroBadge}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">{tc.openingsTitle}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{tc.openingsSubtitle}</p>
        </motion.div>

        <div className="grid gap-4">
          {jobs.slice(0, MAX_JOBS_ON_HOME).map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover-elevate transition-all" data-testid={`home-job-card-${job.id}`}>
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge variant="secondary">
                        {tc.jobTypes[job.type as keyof typeof tc.jobTypes] || job.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.salaryRange}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                  </div>
                  <Link href="/careers">
                    <Button className="shrink-0" data-testid={`button-home-apply-${job.id}`}>
                      {tc.apply} <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/careers">
            <Button variant="outline" data-testid="button-home-view-all-jobs">
              {tc.viewAll} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
