import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LandingPage from "@/pages/LandingPage";
import AdminDashboard from "@/pages/AdminDashboard";
import EventPlanners from "@/pages/EventPlanners";
import Careers from "@/pages/Careers";
import AboutUs from "@/pages/AboutUs";
import WeddingInvitationsLebanon from "@/pages/WeddingInvitationsLebanon";
import BirthdayEventInvites from "@/pages/BirthdayEventInvites";
import ReferralPage from "@/pages/ReferralPage";
import TermsAndConditions from "@/pages/TermsAndConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import GalleryUpload from "@/pages/GalleryUpload";
import GalleryDisplay from "@/pages/GalleryDisplay";
import NotFound from "@/pages/not-found";

// Forces a real HTTP request to the server for server-rendered HTML pages
function ServerPage() {
  window.location.replace(window.location.href);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/event-planners" component={EventPlanners} />
      <Route path="/careers" component={Careers} />
      <Route path="/about" component={AboutUs} />
      <Route path="/wedding-invitations-lebanon" component={WeddingInvitationsLebanon} />
      <Route path="/birthday-event-invites" component={BirthdayEventInvites} />
      <Route path="/referral" component={ReferralPage} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/gallery/:sessionId/display" component={GalleryDisplay} />
      <Route path="/gallery/:sessionId" component={GalleryUpload} />
      <Route path="/proposal/:rest*" component={ServerPage} />
      <Route path="/contract/:rest*" component={ServerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
