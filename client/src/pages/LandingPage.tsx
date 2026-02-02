import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PhoneGallery } from "@/components/PhoneGallery";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { PricingSection } from "@/components/PricingSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { FAQ } from "@/components/FAQ";
import { OrderForm } from "@/components/OrderForm";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleCloseForm = () => {
    setSelectedPackage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PhoneGallery />
        <HowItWorks />
        <FeaturedEvents />
        <PricingSection onSelectPackage={handleSelectPackage} />
        <WhyChooseUs />
        <FAQ />
      </main>
      <Footer />
      
      {/* Order Form Modal */}
      <OrderForm
        selectedPackage={selectedPackage}
        onClose={handleCloseForm}
      />
    </div>
  );
}