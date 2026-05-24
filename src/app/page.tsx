import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import TrustBar from "@/components/site/TrustBar";
import Features from "@/components/site/Features";
import HowItWorks from "@/components/site/HowItWorks";
import RewardCalculator from "@/components/site/RewardCalculator";
import ProjectsShowcase from "@/components/site/ProjectsShowcase";
import RolesSplit from "@/components/site/RolesSplit";
import Testimonials from "@/components/site/Testimonials";
import FAQ from "@/components/site/FAQ";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";
import { buildMetadata, realEstateAgentJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Buy property & earn PRAP Coins — Noida, Greater Noida & India",
  description:
    "PRAP — India's smartest real-estate referral & reward platform. Browse RERA-verified projects, earn 25,000 coins on signup, redeem to bank. Better than 99acres, Magicbricks & Housing.com.",
  path: "/",
  keywords: ["property in noida", "buy flat greater noida", "real estate rewards india"],
});

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <RewardCalculator />
        <ProjectsShowcase />
        <RolesSplit />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgentJsonLd()) }}
      />
    </>
  );
}
