import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  eventDetailsSchema,
  customizationsSchema,
  contactPaymentSchema,
  type EventDetails,
  type Customizations,
  type ContactPayment,
  type SiteSettings,
} from "@shared/schema";
import {
  Calendar,
  MapPin,
  Music,
  UserCheck,
  Phone,
  CreditCard,
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface OrderFormProps {
  selectedPackage: string | null;
  onClose: () => void;
}

type FormStep = 1 | 2 | 3 | 4;

export function OrderForm({ selectedPackage, onClose }: OrderFormProps) {
  const [step, setStep] = useState<FormStep>(1);
  const [eventType, setEventType] = useState<string>("wedding");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  // Fetch settings for dynamic pricing
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  // Build dynamic pricing tiers from settings
  const dynamicPricingTiers = [
    {
      id: "essential",
      name: "Essential",
      price: settings?.essentialPrice ?? 49,
      description: "Perfect for simple, elegant invitations",
      features: settings?.essentialFeatures ?? [
        "Single-page invitation design",
        "Mobile responsive",
        "Custom date & location",
        "Shareable link",
        "3 design revisions",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: settings?.premiumPrice ?? 99,
      description: "Most popular for memorable events",
      features: settings?.premiumFeatures ?? [
        "Multi-page interactive design",
        "Photo gallery integration",
        "Background music",
        "RSVP tracking",
        "5 design revisions",
        "Custom animations",
      ],
      popular: true,
    },
    {
      id: "royal",
      name: "Royal",
      price: settings?.royalPrice ?? 199,
      description: "Ultimate luxury experience",
      features: settings?.royalFeatures ?? [
        "Everything in Premium",
        "Video backgrounds",
        "Guest messaging",
        "Live countdown timer",
        "Unlimited revisions",
        "Priority support",
        "Custom domain option",
      ],
    },
  ];

  const selectedTier = dynamicPricingTiers.find((t) => t.id === selectedPackage);

  // Form for step 1
  const eventForm = useForm<EventDetails>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      names: "",
      eventDate: "",
      locations: [{ name: "Main Venue", address: "", mapLink: "" }],
    },
  });

  const locations = eventForm.watch("locations") || [];

  const addLocation = () => {
    const currentLocations = eventForm.getValues("locations");
    eventForm.setValue("locations", [
      ...currentLocations,
      { name: "", address: "", mapLink: "" },
    ]);
  };

  const removeLocation = (index: number) => {
    const currentLocations = eventForm.getValues("locations");
    if (currentLocations.length > 1) {
      eventForm.setValue(
        "locations",
        currentLocations.filter((_, i) => i !== index)
      );
    }
  };

  // Form for step 3
  const customizationForm = useForm<Customizations>({
    resolver: zodResolver(customizationsSchema),
    defaultValues: {
      songChoice: "",
      rsvpPreference: undefined,
      additionalNotes: "",
    },
  });

  // Form for step 4
  const contactForm = useForm<ContactPayment>({
    resolver: zodResolver(contactPaymentSchema),
    defaultValues: {
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      paymentMethod: "whatsapp",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      eventDetails: EventDetails;
      customizations: Customizations;
      contact: ContactPayment;
    }) => {
      const orderData = {
        packageType: selectedPackage,
        eventType,
        ...data.eventDetails,
        ...data.customizations,
        ...data.contact,
        mediaUrls: [],
        paymentStatus: "pending",
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      const paymentMethod = contactForm.getValues("paymentMethod");
      
      if (paymentMethod === "whatsapp") {
        // Redirect to WhatsApp
        const message = encodeURIComponent(
          `Hi! I'd like to order the ${selectedTier?.name} package for my ${eventType}.\n\nOrder ID: ${data.id}\nNames: ${eventForm.getValues("names")}\nEvent Date: ${eventForm.getValues("eventDate")}`
        );
        window.open(`https://wa.me/96170000000?text=${message}`, "_blank");
      }
      
      toast({
        title: "Order Submitted!",
        description: "We'll get back to you shortly with your custom invitation design.",
      });
      
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = async () => {
    const isValid = await eventForm.trigger();
    if (isValid) {
      setStep(2);
    }
  };

  const handleStep2Submit = () => {
    setStep(3);
  };

  const handleStep3Submit = async () => {
    const isValid = await customizationForm.trigger();
    if (isValid) {
      setStep(4);
    }
  };

  const handleFinalSubmit = async () => {
    const isValid = await contactForm.trigger();
    if (isValid) {
      submitMutation.mutate({
        eventDetails: eventForm.getValues(),
        customizations: customizationForm.getValues(),
        contact: contactForm.getValues(),
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const progress = (step / 4) * 100;

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <Dialog open={!!selectedPackage} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-3">
            {selectedTier?.name} Package
            <span className="text-primary">${selectedTier?.price}</span>
          </DialogTitle>
          <DialogDescription>
            Complete the form below to order your custom digital invitation.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Labels */}
          <div className="flex justify-between mt-3">
            {["Details", "Photos", "Custom", "Payment"].map((label, i) => (
              <span
                key={label}
                className={`text-xs font-medium ${
                  i + 1 <= step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Event Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Form {...eventForm}>
                <form className="space-y-4">
                  {/* Event Type Selection */}
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <RadioGroup
                      value={eventType}
                      onValueChange={setEventType}
                      className="flex flex-wrap gap-3"
                    >
                      {["wedding", "event", "birthday"].map((type) => (
                        <div key={type} className="flex items-center">
                          <RadioGroupItem
                            value={type}
                            id={type}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={type}
                            className="px-4 py-2 rounded-md border border-input cursor-pointer capitalize peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                            data-testid={`radio-${type}`}
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <FormField
                    control={eventForm.control}
                    name="names"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          {eventType === "wedding"
                            ? "Couple Names"
                            : eventType === "birthday"
                            ? "Birthday Person"
                            : "Event Name"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              eventType === "wedding"
                                ? "e.g., John & Jane"
                                : "Enter name"
                            }
                            {...field}
                            data-testid="input-names"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eventForm.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Event Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Multiple Locations */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Locations
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLocation}
                        data-testid="button-add-location"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Location
                      </Button>
                    </div>
                    
                    {locations.map((_, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-md bg-muted/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Location {index + 1}
                          </span>
                          {locations.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLocation(index)}
                              data-testid={`button-remove-location-${index}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        
                        <FormField
                          control={eventForm.control}
                          name={`locations.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Location Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Church, Reception Venue"
                                  {...field}
                                  data-testid={`input-location-name-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={eventForm.control}
                          name={`locations.${index}.address`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Grand Hotel, Beirut"
                                  {...field}
                                  data-testid={`input-location-address-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={eventForm.control}
                          name={`locations.${index}.mapLink`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Google Maps Link (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://maps.google.com/..."
                                  {...field}
                                  data-testid={`input-location-map-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={handleStep1Submit} data-testid="button-next-step1">
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {/* Step 2: Media Upload */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4" />
                    Upload Photos for Gallery
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your favorite photos to include in your invitation gallery.
                  </p>
                  
                  <label
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    data-testid="upload-area"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      data-testid="input-file"
                    />
                  </label>
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                        >
                          <span className="text-sm truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            data-testid={`button-remove-file-${index}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    data-testid="button-back-step2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="button" onClick={handleStep2Submit} data-testid="button-next-step2">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Customizations */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Form {...customizationForm}>
                <form className="space-y-4">
                  <FormField
                    control={customizationForm.control}
                    name="songChoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Background Song (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Ed Sheeran - Perfect"
                            {...field}
                            data-testid="input-song"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customizationForm.control}
                    name="rsvpPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RSVP Feature</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-4"
                          >
                            {[
                              { value: "yes", label: "Enable RSVP" },
                              { value: "no", label: "Disable" },
                              { value: "maybe", label: "Optional" },
                            ].map((option) => (
                              <div key={option.value} className="flex items-center">
                                <RadioGroupItem
                                  value={option.value}
                                  id={`rsvp-${option.value}`}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={`rsvp-${option.value}`}
                                  className="px-4 py-2 rounded-md border border-input cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                                  data-testid={`radio-rsvp-${option.value}`}
                                >
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customizationForm.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requests or preferences..."
                            className="resize-none"
                            rows={3}
                            {...field}
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      data-testid="button-back-step3"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="button" onClick={handleStep3Submit} data-testid="button-next-step3">
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {/* Step 4: Contact & Payment */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Form {...contactForm}>
                <form className="space-y-4">
                  <FormField
                    control={contactForm.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your name"
                            {...field}
                            data-testid="input-contact-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            data-testid="input-contact-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactForm.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+961 70 000 000"
                            {...field}
                            data-testid="input-contact-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Payment Method
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div>
                              <RadioGroupItem
                                value="whatsapp"
                                id="payment-whatsapp"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="payment-whatsapp"
                                className="flex flex-col items-center justify-center p-4 rounded-md border-2 border-input cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-colors"
                                data-testid="radio-payment-whatsapp"
                              >
                                <SiWhatsapp className="w-8 h-8 text-green-500 mb-2" />
                                <span className="font-medium">WhatsApp</span>
                                <span className="text-xs text-muted-foreground">
                                  Pay via chat
                                </span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="stripe"
                                id="payment-stripe"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="payment-stripe"
                                className="flex flex-col items-center justify-center p-4 rounded-md border-2 border-input cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-colors"
                                data-testid="radio-payment-stripe"
                              >
                                <CreditCard className="w-8 h-8 text-primary mb-2" />
                                <span className="font-medium">Card</span>
                                <span className="text-xs text-muted-foreground">
                                  Coming soon
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Order Summary */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span>{selectedTier?.name} Package</span>
                      <span className="font-semibold">${selectedTier?.price}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(3)}
                      data-testid="button-back-step4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-order"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Complete Order
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}