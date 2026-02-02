import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Check,
  Send,
  Loader2,
  Users,
  Sparkles,
  Heart,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type { JobOpening } from "@shared/schema";
import logoImage from "@assets/Logo_1769975575984.png";

const applicationFormSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  resumeUrl: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  coverLetter: z.string().optional(),
  yearsOfExperience: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

const benefits = [
  {
    icon: Users,
    title: "Collaborative Team",
    description: "Work with talented designers and developers who share your passion",
  },
  {
    icon: Sparkles,
    title: "Creative Freedom",
    description: "Express your creativity and bring unique ideas to life",
  },
  {
    icon: Heart,
    title: "Work-Life Balance",
    description: "Flexible hours and remote work options to suit your lifestyle",
  },
];

function JobTypeLabel({ type }: { type: string }) {
  const colors: Record<string, string> = {
    "full-time": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "part-time": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "contract": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "internship": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };
  return (
    <Badge className={colors[type] || "bg-gray-100 text-gray-800"} variant="secondary">
      {type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
}

export default function Careers() {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: jobs = [], isLoading } = useQuery<JobOpening[]>({
    queryKey: ["/api/jobs"],
  });

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      resumeUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
      coverLetter: "",
      yearsOfExperience: "",
    },
  });

  const toggleJobExpand = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Please upload a PDF, DOC, DOCX, TXT, or RTF file", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File size must be less than 10MB", variant: "destructive" });
      return;
    }

    setResumeFile(file);
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      form.setValue("resumeUrl", data.url);
      toast({ title: "Resume uploaded successfully!" });
    } catch (error) {
      toast({ title: "Failed to upload resume. Please try again.", variant: "destructive" });
      setResumeFile(null);
    } finally {
      setUploadingResume(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData & { jobId: string }) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Application submitted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to submit application. Please try again.", variant: "destructive" });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    if (!selectedJob) return;
    submitMutation.mutate({ ...data, jobId: selectedJob.id });
  };

  const handleApply = (job: JobOpening) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
    setSubmitted(false);
    setResumeFile(null);
    form.reset();
  };

  const handleCloseDialog = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
    setSubmitted(false);
    setResumeFile(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background" data-testid="careers-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <a href="/" className="flex items-center" data-testid="link-logo">
              <img src={logoImage} alt="Einvite.me" className="h-8 md:h-10 w-auto" />
            </a>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/"}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Briefcase className="h-4 w-4" />
            <span className="text-sm font-medium">Join Our Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Build the Future of <span className="text-primary">Digital Celebrations</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join Einvite and help millions of people create beautiful, memorable digital invitations 
            for their most special moments.
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Einvite?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be part of a team that makes celebrations more beautiful and accessible
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 md:py-24 bg-muted/30" id="positions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Open Positions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find your next opportunity and grow with us
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Open Positions</h3>
                <p className="text-muted-foreground mb-4">
                  We don't have any open positions at the moment, but we're always looking for talented people.
                </p>
                <p className="text-sm text-muted-foreground">
                  Send your resume to <a href="mailto:careers@einvite.me" className="text-primary hover:underline">careers@einvite.me</a>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => {
                const isExpanded = expandedJobs.has(job.id);
                return (
                  <Card 
                    key={job.id} 
                    className="hover-elevate transition-all"
                    data-testid={`job-card-${job.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{job.title}</h3>
                            <JobTypeLabel type={job.type} />
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                          <div className="mt-3">
                            <p className={`text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
                              {job.description}
                            </p>
                            {job.description && job.description.length > 150 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleJobExpand(job.id)}
                                className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                                data-testid={`button-expand-${job.id}`}
                              >
                                {isExpanded ? (
                                  <>
                                    Show Less <ChevronUp className="h-4 w-4 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    Read More <ChevronDown className="h-4 w-4 ml-1" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          {isExpanded && (
                            <div className="mt-4 space-y-4">
                              {(job.requirements as string[])?.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {(job.requirements as string[]).map((req, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                        <span>{req}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {(job.responsibilities as string[])?.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Responsibilities:</h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {(job.responsibilities as string[]).map((resp, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                        <span>{resp}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleApply(job)}
                          className="shrink-0"
                          data-testid={`button-apply-${job.id}`}
                        >
                          Apply Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Application Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {submitted ? "Application Submitted!" : `Apply for ${selectedJob.title}`}
                </DialogTitle>
                <DialogDescription>
                  {submitted 
                    ? "Thank you for your interest in joining Einvite." 
                    : `${selectedJob.department} • ${selectedJob.location}`
                  }
                </DialogDescription>
              </DialogHeader>

              {submitted ? (
                <div className="text-center py-8" data-testid="application-success">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    We've received your application and will review it shortly. 
                    If your qualifications match our needs, we'll be in touch!
                  </p>
                  <Button onClick={handleCloseDialog} data-testid="button-close-success">
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  {/* Job Details */}
                  <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(selectedJob.requirements as string[]).map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Responsibilities</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(selectedJob.responsibilities as string[]).map((resp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Application Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Name" {...field} data-testid="input-full-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="+961 XX XXX XXX" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="yearsOfExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-experience">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0-1">0-1 years</SelectItem>
                                  <SelectItem value="1-3">1-3 years</SelectItem>
                                  <SelectItem value="3-5">3-5 years</SelectItem>
                                  <SelectItem value="5-10">5-10 years</SelectItem>
                                  <SelectItem value="10+">10+ years</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormItem>
                        <FormLabel>Resume / CV *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.txt,.rtf"
                              className="hidden"
                              data-testid="input-resume-file"
                            />
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            >
                              {uploadingResume ? (
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  <span>Uploading...</span>
                                </div>
                              ) : resumeFile ? (
                                <div className="flex items-center justify-center gap-2 text-primary">
                                  <FileText className="h-5 w-5" />
                                  <span className="font-medium">{resumeFile.name}</span>
                                  <Check className="h-4 w-4 text-green-500" />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                  <Upload className="h-8 w-8" />
                                  <span>Click to upload your resume</span>
                                  <span className="text-xs">PDF, DOC, DOCX, TXT, RTF (Max 10MB)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload your resume to apply for this position
                        </FormDescription>
                      </FormItem>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="portfolioUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Portfolio URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://yourportfolio.com" {...field} data-testid="input-portfolio" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="linkedinUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/in/..." {...field} data-testid="input-linkedin" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="coverLetter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us why you'd be a great fit for this role..."
                                className="min-h-[100px]"
                                {...field} 
                                data-testid="input-cover-letter"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={submitMutation.isPending}
                        data-testid="button-submit-application"
                      >
                        {submitMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit Application
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <a href="/" className="inline-block mb-4">
            <img src={logoImage} alt="Einvite.me" className="h-6 w-auto" />
          </a>
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} einvite.me. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
