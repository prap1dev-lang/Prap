import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import AutoReveal from "@/components/site/AutoReveal";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AutoReveal />
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
