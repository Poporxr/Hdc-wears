"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const HOME_KEYS = ["red-studio", "black-studio", "green-studio", "blue-studio"];
export const ALL_KEYS = [
  "red-studio",
  "black-studio",
  "green-studio",
  "blue-studio",
];

export function useGalleryImages(keys: string[]) {
  const [images, setImages] = useState<Record<string, string>>({});
  useEffect(() => {
    Promise.all(
      keys.map((k) => fetch(`/gallery/${k}.json`).then((r) => r.json()))
    )
      .then((arr) => {
        const d: Record<string, string> = {};
        keys.forEach((k, i) => {
          d[k] = arr[i].src;
        });
        setImages(d);
      })
      .catch(() => {});
  }, [keys.join(",")]);
  return images;
}

export default function GallerySection() {
  const images = useGalleryImages(HOME_KEYS);
  return (
    <section className="mt-16 -mx-4 md:mx-0">
      <div className="px-4 md:px-0 flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-neutral-400 mb-2">
            SHOT BY THE COMMUNITY
          </p>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight">
            HDC WORLD
          </h2>
        </div>
        <Link
          href="/gallery"
          className="text-xs font-bold tracking-widest underline underline-offset-4 hover:opacity-70 transition-opacity shrink-0"
        >
          VIEW ALL
        </Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory px-4 md:px-0 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HOME_KEYS.map((k) => (
          <div
            key={k}
            className="group relative snap-start shrink-0 w-[62vw] md:w-[31%] aspect-[4/5] overflow-hidden bg-[#f1f2f5] first:rounded-l-xl last:rounded-r-xl md:rounded-xl"
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
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        <Link
          href="/gallery"
          className="snap-start shrink-0 w-[38vw] md:w-[18%] aspect-[4/5] rounded-xl bg-detta-navy text-white flex flex-col items-center justify-center gap-2 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
        >
          <span className="text-2xl leading-none">→</span>
          VIEW MORE
        </Link>
      </div>
    </section>
  );
}
