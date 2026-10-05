import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { GalleryGrid, DisplaySection, StudioSection } from "@/components/GallerySection";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "HDC World community shots and studio product photoshoots from High Dream Chasers.",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight text-center">
          GALLERY
        </h1>
        <p className="text-neutral-500 text-sm text-center mt-3 mb-10">
          The world wearing HDC, and the studio behind it.
        </p>

        <p className="text-xs font-bold tracking-[0.25em] text-neutral-400 mb-2">
          SHOT BY THE COMMUNITY
        </p>
        <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight mb-6">
          HDC WORLD
        </h2>
        <GalleryGrid />

        <DisplaySection />

        <StudioSection />
      </main>
      <SiteFooter />
    </div>
  );
}
