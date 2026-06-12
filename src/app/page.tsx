import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import TrustBar from "@/components/site/TrustBar";
import ProjectsShowcase from "@/components/site/ProjectsShowcase";
import BuyerServices from "@/components/site/BuyerServices";
import HowItWorks from "@/components/site/HowItWorks";
import RewardCalculator from "@/components/site/RewardCalculator";
import EmiCalculator from "@/components/site/EmiCalculator";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";
import JoinPopup from "@/components/site/JoinPopup";
import { buildMetadata, realEstateAgentJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Buy property & earn PRAP Coins — Noida, Greater Noida & India",
  description:
    "PRAP — India's smartest real-estate referral & reward platform. Browse RERA-verified projects, earn 25,000 coins on signup, redeem to bank. Zero brokerage, builder-direct.",
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
        <ProjectsShowcase />
        <BuyerServices />
        <HowItWorks />
        <RewardCalculator />
        <EmiCalculator />
        <CTA />
      </main>
      <Footer />
      <JoinPopup />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgentJsonLd()) }}
      />
    </>
  );
}
