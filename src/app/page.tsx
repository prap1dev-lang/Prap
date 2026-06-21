import Navbar from "@/components/site/Navbar";
import HeroParallax from "@/components/site/HeroParallax";
import SmoothScroll from "@/components/site/SmoothScroll";
import TrustBar from "@/components/site/TrustBar";
import ProjectsShowcase from "@/components/site/ProjectsShowcase";
import ProjectRail from "@/components/site/ProjectRail";
import { BlueprintDivider } from "@/components/site/Blueprint";
import { listProjects } from "@/lib/projects-db";
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

export default async function HomePage() {
  const [highDemand, newlyLaunched] = await Promise.all([
    listProjects({ highDemand: true, limit: 10 }),
    listProjects({ newlyLaunched: true, limit: 10 }),
  ]);

  return (
    <>
      <SmoothScroll />
      <Navbar />
      <main>
        <HeroParallax />
        <TrustBar />
        <ProjectRail eyebrow="Trending now" title="Projects in High Demand" projects={highDemand} />
        <ProjectRail eyebrow="Just launched" title="Newly Launched" projects={newlyLaunched} />
        <ProjectsShowcase />
        <BuyerServices />
        <HowItWorks />
        <div className="container py-2"><BlueprintDivider className="h-4 w-full text-brand-900/15" /></div>
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
