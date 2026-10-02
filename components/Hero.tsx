"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { heroSlides, img } from "@/lib/products";

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[index];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Mobile: compact side-by-side, text overlapping into the portrait image */}
      <div className="flex md:hidden items-stretch min-h-[340px]">
        <div className="flex-1 pl-5 pr-0 py-8 relative z-10 -mr-12 flex flex-col justify-center">
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
          <Link
            href="/#shop"
            className="inline-block mt-4 bg-detta-navy text-white text-xs font-bold tracking-wide px-7 py-3 rounded-lg w-fit"
          >
            {slide.cta}
          </Link>
          <div className="flex gap-1.5 mt-5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1 rounded-full transition-all ${
                  i === index ? "w-6 bg-black" : "w-2 bg-neutral-300"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="w-[48%] shrink-0 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={slide.imageSeed}
            src={img(slide.imageSeed, 600, 900)}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Desktop: roomy side-by-side */}
      <div className="hidden md:grid md:grid-cols-2 items-center">
        <div className="px-6 py-10 md:py-20 md:pl-16 max-w-xl">
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
          <Link
            href="/#shop"
            className="inline-block mt-7 bg-detta-navy text-white text-sm font-bold tracking-wide px-10 py-3.5 rounded-lg hover:opacity-90"
          >
            {slide.cta}
          </Link>
          <div className="flex gap-2 mt-8">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-black" : "w-3 bg-neutral-300"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="relative h-72 md:h-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={slide.imageSeed}
            src={img(slide.imageSeed, 900, 900)}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
