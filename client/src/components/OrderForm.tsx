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
  Info,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, language, formatPrice } = useLanguage();
  const tf = t.orderForm;

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const getFeatures = (dbFeatures: string[] | null | undefined, translatedFeatures: readonly string[]) => {
    if (language === "fr") return translatedFeatures;
    return dbFeatures ?? translatedFeatures;
  };

  const dynamicPricingTiers = [
    {
      id: "essential",
      name: t.pricing.plans.essential.name,
      price: settings?.essentialPrice ?? 49,
      description: t.pricing.plans.essential.description,
      features: getFeatures(settings?.essentialFeatures, t.pricing.plans.essential.features),
    },
    {
      id: "premium",
      name: t.pricing.plans.premium.name,
      price: settings?.premiumPrice ?? 99,
      description: t.pricing.plans.premium.description,
      features: getFeatures(settings?.premiumFeatures, t.pricing.plans.premium.features),
      popular: true,
    },
    {
      id: "royal",
      name: t.pricing.plans.royal.name,
      price: settings?.royalPrice ?? 199,
      description: t.pricing.plans.royal.description,
      features: getFeatures(settings?.royalFeatures, t.pricing.plans.royal.features),
    },
  ];

  const selectedTier = dynamicPricingTiers.find((t) => t.id === selectedPackage);

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

  const customizationForm = useForm<Customizations>({
    resolver: zodResolver(customizationsSchema),
    defaultValues: {
      songChoice: "",
      rsvpPreference: undefined,
      additionalNotes: "",
    },
  });

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
      let mediaUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file) => {
          formData.append("media", file);
        });
        const uploadRes = await fetch("/api/upload/media", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error("Failed to upload media files");
        }
        const uploadData = await uploadRes.json();
        mediaUrls = uploadData.urls;
      }

      const storedRef = localStorage.getItem("einvite_ref_code") || undefined;
      const orderData = {
        packageType: selectedPackage,
        eventType,
        ...data.eventDetails,
        ...data.customizations,
        ...data.contact,
        mediaUrls,
        paymentStatus: "pending",
        ...(storedRef ? { referralCode: storedRef } : {}),
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      const paymentMethod = contactForm.getValues("paymentMethod");
      
      if (paymentMethod === "whatsapp") {
        const message = encodeURIComponent(
          `${tf.whatsappMessage} ${selectedTier?.name} ${tf.whatsappPackage} ${eventType}.\n\n${tf.whatsappOrderId}: ${data.id}\n${tf.whatsappNames}: ${eventForm.getValues("names")}\n${tf.whatsappDate}: ${eventForm.getValues("eventDate")}`
        );
        const whatsappNum = settings?.whatsappNumber?.replace(/[^0-9]/g, "") || "96181824782";
        window.open(`https://wa.me/${whatsappNum}?text=${message}`, "_blank");
      }
      
      toast({
        title: tf.successTitle,
        description: tf.successDesc,
      });
      
      onClose();
    },
    onError: () => {
      toast({
        title: tf.errorTitle,
        description: tf.errorDesc,
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

  const namesLabel =
    eventType === "wedding"
      ? tf.names.wedding
      : eventType === "birthday"
      ? tf.names.birthday
      : tf.names.event;

  const namesPlaceholder =
    eventType === "wedding"
      ? tf.namePlaceholder.wedding
      : tf.namePlaceholder.other;

  return (
    <Dialog open={!!selectedPackage} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-3">
            {selectedTier?.name} {tf.package}
            <span className="text-primary">{formatPrice(selectedTier?.price ?? 0)}</span>
          </DialogTitle>
          <DialogDescription>
            {tf.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{tf.step} {step} {tf.of} 4</span>
            <span>{Math.round(progress)}% {tf.complete}</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-3">
            {tf.stepLabels.map((label, i) => (
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
                  <div className="space-y-2">
                    <Label>{tf.eventType}</Label>
                    <RadioGroup
                      value={eventType}
                      onValueChange={setEventType}
                      className="flex flex-wrap gap-3"
                    >
                      {(["wedding", "event", "birthday"] as const).map((type) => (
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
                            {tf.eventTypes[type]}
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
                          {namesLabel}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={namesPlaceholder}
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
                          {tf.eventDate}
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {tf.locations}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLocation}
                        data-testid="button-add-location"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {tf.addLocation}
                      </Button>
                    </div>
                    
                    {locations.map((_, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-md bg-muted/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {tf.locationLabel} {index + 1}
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
                              <FormLabel className="text-xs">{tf.locationName}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={tf.locationNamePlaceholder}
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
                              <FormLabel className="text-xs">{tf.address}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={tf.addressPlaceholder}
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
                              <FormLabel className="text-xs">{tf.mapLink}</FormLabel>
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
                      {tf.next}
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
                    {tf.uploadTitle}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tf.uploadSubtitle}
                  </p>
                  
                  <label
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    data-testid="upload-area"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {tf.uploadCta}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {tf.uploadTypes}
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

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>{tf.uploadedFiles}</Label>
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
                    {tf.back}
                  </Button>
                  <Button type="button" onClick={handleStep2Submit} data-testid="button-next-step2">
                    {tf.next}
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
                          {tf.backgroundSong}
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
                        <FormLabel>{tf.rsvpFeature}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-4"
                          >
                            {(["yes", "no", "maybe"] as const).map((option) => (
                              <div key={option} className="flex items-center">
                                <RadioGroupItem
                                  value={option}
                                  id={`rsvp-${option}`}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={`rsvp-${option}`}
                                  className="px-4 py-2 rounded-md border border-input cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                                  data-testid={`radio-rsvp-${option}`}
                                >
                                  {tf.rsvpOptions[option]}
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
                        <FormLabel>{tf.additionalNotes}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={tf.additionalNotesPlaceholder}
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
                      {tf.back}
                    </Button>
                    <Button type="button" onClick={handleStep3Submit} data-testid="button-next-step3">
                      {tf.next}
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
                        <FormLabel>{tf.yourName}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={tf.yourNamePlaceholder}
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
                        <FormLabel>{tf.email}</FormLabel>
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
                          {tf.phone}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+961 81 824 782"
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
                          {tf.paymentMethod}
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
                                  {tf.whatsappPaymentDesc}
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

                  {/* Deposit & non-refundable notice */}
                  <div className="space-y-2 mt-4" data-testid="payment-nonrefundable-notice">
                    <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-semibold">{tf.depositNote}</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200">
                      <Info className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-800 leading-relaxed font-medium">
                        {settings?.nonRefundableNotice || tf.nonRefundableNotice}{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-red-700 hover:text-red-900 whitespace-nowrap"
                          data-testid="link-terms-and-conditions"
                        >
                          {tf.viewTerms}
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">{tf.orderSummary}</h4>
                    <div className="flex justify-between text-sm">
                      <span>{selectedTier?.name} {tf.package}</span>
                      <span className="font-semibold">{formatPrice(selectedTier?.price ?? 0)}</span>
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
                      {tf.back}
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
                          {tf.submitting}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {tf.submit}
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
