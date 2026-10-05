import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/toast";
import ImagePreloader from "@/components/ImagePreloader";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — High Dream Chasers`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HDC Wears",
    "High Dream Chasers",
    "Nigerian streetwear",
    "Lagos fashion",
    "bandana tee",
    "streetwear Nigeria",
    "buy clothes online Nigeria",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — High Dream Chasers`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — High Dream Chasers`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>{children}</ToastProvider>
          </StoreProvider>
        </AuthProvider>
        <ImagePreloader />
      </body>
    </html>
  );
}
