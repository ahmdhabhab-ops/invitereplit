import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PhoneGallery } from "@/components/PhoneGallery";
import { PromoVideo } from "@/components/PromoVideo";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { PricingSection } from "@/components/PricingSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { FAQ } from "@/components/FAQ";
import { JobOpenings } from "@/components/JobOpenings";
import { OrderForm } from "@/components/OrderForm";
import { Footer } from "@/components/Footer";
import { SpinWheel, SpinBanner, SpinFloatingButton } from "@/components/SpinWheel";

export default function LandingPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [spinOpen, setSpinOpen] = useState(false);

  // Capture ?ref= query param and store in localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("einvite_ref_code", ref);
    }
  }, []);

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
        <PromoVideo />
        <HowItWorks />
        <FeaturedEvents />
        <PricingSection onSelectPackage={handleSelectPackage} />
        <SpinBanner onOpen={() => setSpinOpen(true)} />
        <WhyChooseUs />
        <FAQ />
        <JobOpenings />
      </main>
      <Footer />
      
      {/* Order Form Modal */}
      <OrderForm
        selectedPackage={selectedPackage}
        onClose={handleCloseForm}
      />

      {/* Spin the Wheel Modal */}
      <SpinWheel isOpen={spinOpen} onClose={() => setSpinOpen(false)} />

      {/* Floating spin button */}
      <SpinFloatingButton onOpen={() => setSpinOpen(true)} />
    </div>
  );
}