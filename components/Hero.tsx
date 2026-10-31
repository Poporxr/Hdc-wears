"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { heroSlides } from "@/lib/products";
import { cl } from "@/lib/db";

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
            <h1 className="font-display font-black text-[2.1rem] leading-[0.95] tracking-tight whitespace-pre-line">
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
  const title = slide.title.replace(/\n/g, " ");
  return (
    <div className="w-full">
      <div className="flex items-stretch">
        <div className="flex-1 px-10 xl:pl-24 py-16 flex flex-col justify-center">
          <div className="animate-hero-in-left">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-black" />
              <p className="text-sm font-extrabold tracking-[0.22em]">
                {slide.eyebrow}
              </p>
            </div>
            <h1 className="font-display font-black text-7xl xl:text-8xl leading-[0.9] tracking-tight">
              {title}
            </h1>
            <p className="text-neutral-600 text-lg leading-relaxed max-w-lg mt-7 min-h-[3.5rem]">
              {slide.copy}
            </p>
            <Link
              href="/#shop"
              className="inline-block mt-10 bg-detta-navy text-white text-base font-bold tracking-wide px-12 py-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
        <div className="relative h-[680px] aspect-[2/3] shrink-0 overflow-hidden">
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
  const [isMobile, setIsMobile] = useState(false);

  // Hero artwork served from Cloudinary, sized per viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % N), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[index % N];
  const src =
    slide.img ??
    cl(
      `hero/${slide.colorKey}-${isMobile ? "mobile" : "desktop"}`,
      isMobile ? "f_auto,q_auto,w_600" : "f_auto,q_auto,w_1000"
    );

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
