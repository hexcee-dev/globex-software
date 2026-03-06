import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://globexcargo.in";
const siteName = "Globex Courier and Logistics";
const defaultDescription =
  "Globex offers courier and logistics services across India, UAE (Dubai), Saudi Arabia, and Oman. Air cargo, sea freight, door-to-door delivery, and warehousing. Track your shipments online.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${siteName} | India, Dubai, Saudi Arabia, Oman`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "courier India",
    "logistics India",
    "courier Dubai",
    "logistics Dubai",
    "courier UAE",
    "courier Saudi Arabia",
    "logistics Saudi Arabia",
    "courier Oman",
    "logistics Oman",
    "air cargo India",
    "sea freight UAE",
    "door to door courier",
    "shipment tracking",
    "international courier",
    "Globex courier",
  ],
  authors: [{ name: "Globex", url: SITE_URL }],
  creator: "Globex",
  publisher: "Globex",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName,
    title: `${siteName} – India, Dubai, Saudi Arabia, Oman`,
    description: defaultDescription,
    images: [{ url: "/globex%20Logo.png", width: 400, height: 112, alt: "Globex Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} – India, Dubai, Saudi Arabia, Oman`,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
  category: "logistics",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: siteName,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/globex%20Logo.png` },
      description: defaultDescription,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kochi",
        addressRegion: "Kerala",
        postalCode: "682036",
        addressCountry: "IN",
        streetAddress: "Wbb business space, 60/60E, 3rd floor, JC Champer, Panampilly Nagar",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-8086884456",
        contactType: "customer service",
        email: "iglobexindia@gmail.com",
        areaServed: ["IN", "AE", "SA", "OM"],
        availableLanguage: "English, Hindi",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: siteName,
      image: `${SITE_URL}/globex%20Logo.png`,
      description: defaultDescription,
      url: SITE_URL,
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Place", name: "Dubai" },
        { "@type": "Country", name: "Saudi Arabia" },
        { "@type": "Country", name: "Oman" },
      ],
      priceRange: "$$",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
