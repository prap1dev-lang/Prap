import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="h1 mt-4">Page not found.</h1>
        <p className="mt-4 text-ink-700 max-w-md mx-auto">
          The page you're looking for has moved or doesn't exist.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/projects" className="btn-outline">Browse projects</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
