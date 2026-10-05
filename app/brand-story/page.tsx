import type { Metadata } from "next";
import BrandStoryClient from "./BrandStoryClient";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Brand Story",
  description: `The story behind ${SITE_NAME} — built from ambition, raised by craft. ${SITE_TAGLINE}`,
  alternates: { canonical: `${SITE_URL}/brand-story` },
  openGraph: {
    url: `${SITE_URL}/brand-story`,
    siteName: SITE_NAME,
    title: `Brand Story — ${SITE_NAME}`,
    description: "Built from ambition, raised by craft. The story of High Dream Chasers.",
  },
};

export default function BrandStoryPage() {
  return <BrandStoryClient />;
}
