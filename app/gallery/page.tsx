import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import GalleryExperience from "@/components/GalleryV2";

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
      <main>
        <GalleryExperience />
      </main>
      <SiteFooter />
    </div>
  );
}
