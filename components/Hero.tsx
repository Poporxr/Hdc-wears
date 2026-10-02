"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { heroSlides } from "@/lib/products";

const N = heroSlides.length;

function MobileSlide({ i, src }: { i: number; src: string | null }) {
  const slide = heroSlides[i % N];
  return (
    <div className="w-full">
      <div className="flex items-stretch min-h-[340px]">
        <div className="flex-1 pl-5 pr-0 py-8 relative z-10 -mr-12 flex flex-col justify-center">
          <div className="animate-hero-in-left">
            <p className="text-[10px] font-extrabold tracking-[0.18em] mb-2">
              {slide.eyebrow}
            </p>
            <h1 className="font-display font-black text-[2.75rem] leading-[0.95] tracking-tight whitespace-pre-line">
              {slide.title}
            </h1>
            <div className="w-12 h-[3px] bg-black my-3" />
            <p className="text-neutral-600 text-xs leading-relaxed max-w-[220px]">
              {slide.copy}
            </p>
          </div>
          <Link
            href="/#shop"
            className="inline-block mt-4 bg-detta-navy text-white text-xs font-bold tracking-wide px-7 py-3 rounded-lg w-fit"
          >
            {slide.cta}
          </Link>
        </div>
        <div className="w-[48%] shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 hero-fade-left animate-hero-in-right">
            {src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={src}
                alt={slide.title}
                fetchPriority="high"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            ) : (
              <div className="absolute inset-0 animate-pulse bg-neutral-100" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSlide({ i, src }: { i: number; src: string | null }) {
  const slide = heroSlides[i % N];
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 items-center">
        <div className="px-6 py-10 md:py-20 md:pl-16 max-w-xl">
          <div className="animate-hero-in-left">
            <p className="text-xs font-extrabold tracking-[0.2em] mb-3">
              {slide.eyebrow}
            </p>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[0.95] tracking-tight whitespace-pre-line">
              {slide.title}
            </h1>
            <div className="w-16 h-1 bg-black my-5" />
            <p className="text-neutral-600 text-[15px] leading-relaxed max-w-sm">
              {slide.copy}
            </p>
          </div>
          <Link
            href="/#shop"
            className="inline-block mt-7 bg-detta-navy text-white text-sm font-bold tracking-wide px-10 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            {slide.cta}
          </Link>
        </div>
        <div className="relative h-72 md:h-[520px] overflow-hidden">
          <div className="absolute inset-0 hero-fade-left animate-hero-in-right">
            {src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={src}
                alt={slide.title}
                fetchPriority="high"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 animate-pulse bg-neutral-100" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<Record<string, string> | null>(null);

  // Hero artwork ships as data URIs in per-color JSON files so it deploys with the site
  useEffect(() => {
    const kind = window.innerWidth < 768 ? "mobile" : "desktop";
    const colors = ["red", "black", "green", "blue"];
    Promise.all(
      colors.map((c) =>
        fetch(`/hero-images-${kind}-${c}.json`).then((r) => r.json())
      )
    )
      .then((arr) => {
        const d: Record<string, string> = {};
        colors.forEach((c, i) => {
          d[c] = arr[i].src;
        });
        setImages(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % N), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[index % N];
  const src = images?.[slide.colorKey] ?? null;

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Mobile — key remount replays the directional entrances */}
      <div className="md:hidden" key={`m-${index}`}>
        <MobileSlide i={index} src={src} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block" key={`d-${index}`}>
        <DesktopSlide i={index} src={src} />
      </div>
    </section>
  );
}
