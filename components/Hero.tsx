"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { heroSlides } from "@/lib/products";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const N = heroSlides.length;
const TRACK_MS = 800;

function MobileSlide({ i, active }: { i: number; active: boolean }) {
  const slide = heroSlides[i % N];
  return (
    <div className="w-full shrink-0">
      <div className="flex items-stretch min-h-[340px]">
        <div className="flex-1 pl-5 pr-0 py-8 relative z-10 -mr-12 flex flex-col justify-center">
          <div
            key={`t-${i}-${active}`}
            className={active ? "animate-hero-in-left" : ""}
          >
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
          <div
            key={`m-${i}-${active}`}
            className={`absolute inset-0 hero-fade-left ${active ? "animate-hero-in-right" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageMobile}
              alt={slide.title}
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSlide({ i, active }: { i: number; active: boolean }) {
  const slide = heroSlides[i % N];
  return (
    <div className="w-full shrink-0">
      <div className="grid grid-cols-2 items-center">
        <div className="px-6 py-10 md:py-20 md:pl-16 max-w-xl">
          <div
            key={`t-${i}-${active}`}
            className={active ? "animate-hero-in-left" : ""}
          >
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
          <div
            key={`m-${i}-${active}`}
            className={`absolute inset-0 hero-fade-left ${active ? "animate-hero-in-right" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageDesktop}
              alt={slide.title}
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  // index ranges 0..N; index N renders a clone of slide 0 for a seamless loop
  const [index, setIndex] = useState(0);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setInstant(false);
      setIndex((i) => (i >= N ? N : i + 1));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // When the clone (index N) finishes sliding in, snap back to 0 instantly
  useEffect(() => {
    if (index === N) {
      const t = setTimeout(() => {
        setInstant(true);
        setIndex(0);
      }, TRACK_MS + 50);
      return () => clearTimeout(t);
    }
  }, [index]);

  // Re-enable animation shortly after the instant snap
  useEffect(() => {
    if (instant) {
      const t = setTimeout(() => setInstant(false), 60);
      return () => clearTimeout(t);
    }
  }, [instant]);

  const trackClass = `flex ${EASE} ${
    instant ? "" : "transition-transform duration-[800ms]"
  }`;
  const trackStyle = { transform: `translateX(-${index * 100}%)` };
  // render slides 0..N-1 plus a clone of slide 0 at position N
  const positions = Array.from({ length: N + 1 }, (_, i) => i);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Mobile */}
      <div className="md:hidden overflow-hidden">
        <div className={trackClass} style={trackStyle}>
          {positions.map((i) => (
            <MobileSlide key={i} i={i} active={index === i} />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-hidden">
        <div className={trackClass} style={trackStyle}>
          {positions.map((i) => (
            <DesktopSlide key={i} i={i} active={index === i} />
          ))}
        </div>
      </div>
    </section>
  );
}
