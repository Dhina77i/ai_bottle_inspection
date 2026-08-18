import { useEffect, useState } from "react";
import Navbar from "../components/landing/Navbar.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import FeaturesSection from "../components/landing/FeaturesSection.jsx";
import WorkflowSection from "../components/landing/WorkflowSection.jsx";
import TechStackSection from "../components/landing/TechStackSection.jsx";
import AnalyticsPreviewSection from "../components/landing/AnalyticsPreviewSection.jsx";
import CTASection from "../components/landing/CTASection.jsx";
import Footer from "../components/landing/Footer.jsx";

export default function Landing() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((current) => !current);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(30,144,255,0.14),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_26%)]" />

      <div className="pointer-events-none absolute left-1/2 top-32 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">
        <Navbar
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
        />

        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <TechStackSection />
        <AnalyticsPreviewSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}