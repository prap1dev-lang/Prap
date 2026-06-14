import type { Metadata } from "next";

export const SITE = {
  name: "PRAP",
  fullName: "PRAP — Property Referral Award Platform",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://prap.in",
  // Single source of truth for the public contact number.
  phone: "7688999955",
  phoneDisplay: "+91 76889 99955",
  phoneTel: "+917688999955",
  email: "support@prap.in",
  description:
    "PRAP is India's first reward-driven real-estate referral platform. Visit verified RERA projects in Noida, Greater Noida & across India, earn PRAP Coins (1 Coin = ₹1), redeem to bank or use against property payments.",
  keywords: [
    "PRAP",
    "Property Referral Award Platform",
    "Real Estate Noida",
    "Greater Noida properties",
    "VVIP Noida",
    "Irish Platinum",
    "RERA verified projects",
    "Property referral rewards",
    "Site visit bonus",
    "Buy property Noida",
    "Buy flat Greater Noida",
    "Property broker platform",
    "Real estate corporate referral",
    "PRAP Coins",
    "Property cashback India",
    "Best alternative to 99acres",
    "Magicbricks alternative",
    "Housing.com alternative",
  ],
  ogImage: "/og/prap-og.png",
  twitter: "@prap_in",
  locale: "en_IN",
};

type BuildMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
};

export function buildMetadata(opts: BuildMetaOptions = {}): Metadata {
  const title = opts.title
    ? `${opts.title} | ${SITE.name}`
    : SITE.fullName;
  const description = opts.description || SITE.description;
  const url = `${SITE.url}${opts.path || ""}`;
  const image = opts.image || SITE.ogImage;
  const keywords = [...SITE.keywords, ...(opts.keywords || [])];

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    keywords,
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    alternates: { canonical: url },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SITE.twitter,
      images: [image],
    },
    category: "real estate",
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.fullName,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    description: SITE.description,
    sameAs: [
      "https://twitter.com/prap_in",
      "https://www.linkedin.com/company/prap",
      "https://www.instagram.com/prap.in",
      "https://www.facebook.com/prap.in",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: SITE.phoneTel,
        email: "support@prap.in",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/projects?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function realEstateAgentJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE.name,
    image: `${SITE.url}/logo.png`,
    url: SITE.url,
    telephone: SITE.phoneTel,
    areaServed: ["Noida", "Greater Noida", "Delhi NCR", "India"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
  };
}
