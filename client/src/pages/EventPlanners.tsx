import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { SiteSettings } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Check, 
  Users, 
  Percent, 
  Headphones, 
  Zap,
  Star,
  Send,
  Loader2,
  Building2,
  Calendar,
  Award
} from "lucide-react";
import logoImage from "@assets/Logo_1769975575984.png";

const partnershipFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  eventsPerYear: z.string().min(1, "Please select events per year"),
  eventTypes: z.array(z.string()).min(1, "Please select at least one event type"),
  message: z.string().optional(),
});

type PartnershipFormData = z.infer<typeof partnershipFormSchema>;

const eventTypeOptions = [
  { id: "weddings", label: "Weddings" },
  { id: "corporate", label: "Corporate Events" },
  { id: "birthdays", label: "Birthday Parties" },
  { id: "conferences", label: "Conferences" },
  { id: "galas", label: "Galas & Fundraisers" },
  { id: "other", label: "Other Events" },
];

const benefitIcons = [Percent, Headphones, Zap, Users, Star, Award];

export default function EventPlanners() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  // Dynamic content from settings
  const heroTitle = settings?.eventPlannersHeroTitle || "Partner With Einvite";
  const heroSubtitle = settings?.eventPlannersHeroSubtitle || "Join our exclusive partner program and offer your clients stunning digital invitations at special rates. Grow your business while providing premium service.";
  const heroBadge = settings?.eventPlannersBadge || "For Event Professionals";
  const heroFeatures = settings?.eventPlannersHeroFeatures || ["Up to 40% Discount", "Priority Support", "White Label Options"];
  
  const partnerBenefits = (settings?.eventPlannersBenefits || [
    { title: "Exclusive Discounts", description: "Up to 40% off on all invitation packages for your clients" },
    { title: "Priority Support", description: "Dedicated account manager and 24/7 priority customer support" },
    { title: "Fast Turnaround", description: "Rush delivery options with guaranteed 24-48 hour turnaround" },
    { title: "White Label Options", description: "Co-branded invitations with your company logo and branding" },
    { title: "Premium Features", description: "Access to exclusive templates and design elements" },
    { title: "Partner Recognition", description: "Featured in our partner directory and referral program" },
  ]).map((benefit, index) => ({
    ...benefit,
    icon: benefitIcons[index] || Star,
  }));

  const partnerTiers = [
    {
      name: settings?.eventPlannersSilverName || "Silver Partner",
      events: settings?.eventPlannersSilverEvents || "1-10 events/year",
      discount: settings?.eventPlannersSilverDiscount || "15%",
      features: settings?.eventPlannersSilverFeatures || ["10% discount on all packages", "Standard support", "Partner badge"],
    },
    {
      name: settings?.eventPlannersGoldName || "Gold Partner",
      events: settings?.eventPlannersGoldEvents || "11-50 events/year",
      discount: settings?.eventPlannersGoldDiscount || "25%",
      features: settings?.eventPlannersGoldFeatures || ["25% discount on all packages", "Priority support", "White label option", "Custom templates"],
      popular: true,
    },
    {
      name: settings?.eventPlannersPlatinumName || "Platinum Partner",
      events: settings?.eventPlannersPlatinumEvents || "50+ events/year",
      discount: settings?.eventPlannersPlatinumDiscount || "40%",
      features: settings?.eventPlannersPlatinumFeatures || ["40% discount on all packages", "Dedicated account manager", "Free rush delivery", "Co-marketing opportunities", "API access"],
    },
  ];

  const form = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipFormSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      eventsPerYear: "",
      eventTypes: [],
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: PartnershipFormData) => {
      const res = await apiRequest("POST", "/api/partnership-requests", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Partnership request submitted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to submit request. Please try again.", variant: "destructive" });
    },
  });

  const onSubmit = (data: PartnershipFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="event-planners-page">
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
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">{heroBadge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {heroTitle.includes("Einvite") ? (
              <>
                {heroTitle.split("Einvite")[0]}
                <span className="text-primary">Einvite</span>
                {heroTitle.split("Einvite")[1]}
              </>
            ) : (
              heroTitle
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
            {heroFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Partner Benefits</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unlock exclusive perks and grow your event planning business with Einvite
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerBenefits.map((benefit, index) => (
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

      {/* Partner Tiers */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Partner Tiers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the partnership level that fits your business volume
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnerTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${tier.popular ? "border-primary shadow-lg" : ""}`}
                data-testid={`tier-${tier.name.toLowerCase().replace(" ", "-")}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.events}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-primary mb-4">{tier.discount}</div>
                  <p className="text-sm text-muted-foreground mb-6">discount on all packages</p>
                  <ul className="space-y-3 text-left">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Form */}
      <section className="py-16 md:py-24" id="apply">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Apply for Partnership</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8" data-testid="success-message">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for your interest in partnering with Einvite. 
                    Our team will review your application and contact you within 24 hours.
                  </p>
                  <Button onClick={() => window.location.href = "/"} data-testid="button-back-home-success">
                    Back to Home
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company" {...field} data-testid="input-company-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Name" {...field} data-testid="input-contact-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@company.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+961 XX XXX XXX" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourcompany.com" {...field} data-testid="input-website" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventsPerYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Events Per Year *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-events-per-year">
                                <SelectValue placeholder="Select volume" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 events</SelectItem>
                              <SelectItem value="11-50">11-50 events</SelectItem>
                              <SelectItem value="51-100">51-100 events</SelectItem>
                              <SelectItem value="100+">100+ events</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventTypes"
                      render={() => (
                        <FormItem>
                          <FormLabel>Event Types You Handle *</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {eventTypeOptions.map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="eventTypes"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...field.value, option.id]
                                            : field.value.filter((v) => v !== option.id);
                                          field.onChange(updated);
                                        }}
                                        data-testid={`checkbox-${option.id}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us more about your business and partnership goals..."
                              className="min-h-[100px]"
                              {...field} 
                              data-testid="input-message"
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
                      data-testid="button-submit"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Submit Partnership Request
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

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
