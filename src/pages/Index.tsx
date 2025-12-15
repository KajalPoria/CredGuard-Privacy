import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import StatsSection from "@/components/sections/StatsSection";
import SecuritySection from "@/components/sections/SecuritySection";
import ComplianceSection from "@/components/sections/ComplianceSection";
import CTASection from "@/components/sections/CTASection";
import InteractiveDemoSection from "@/components/sections/InteractiveDemoSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <InteractiveDemoSection />
        <StatsSection />
        <HowItWorksSection />
        <SecuritySection />
        <ComplianceSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
