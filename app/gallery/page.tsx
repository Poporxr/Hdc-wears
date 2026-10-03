"use client";

import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { ALL_KEYS, useGalleryImages } from "@/components/GallerySection";

export default function GalleryPage() {
  const images = useGalleryImages(ALL_KEYS);
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight text-center">
          HDC WORLD
        </h1>
        <p className="text-neutral-500 text-sm text-center mt-3 mb-10">
          Photoshoots with the brand outfits. High Dream Chasers.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
          {ALL_KEYS.map((k) => (
            <div
              key={k}
              className="group relative aspect-[4/5] overflow-hidden bg-[#f1f2f5]"
            >
              {images[k] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={images[k]}
                  alt={`HDC photoshoot ${k}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-neutral-100" />
              )}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
