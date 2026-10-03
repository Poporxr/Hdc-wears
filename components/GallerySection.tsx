"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchGallery, type GalleryImage, cl } from "@/lib/db";

function Tile({ image, label }: { image: string; label: string }) {
  return (
    <div className="group relative aspect-[4/5] overflow-hidden bg-[#f1f2f5]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
      />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="aspect-[4/5] animate-pulse bg-neutral-100" />
  );
}

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  useEffect(() => {
    fetchGallery()
      .then(setImages)
      .catch(() => setImages([]));
  }, []);

  const shown = images.slice(0, 4);

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
        {shown.length === 0
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="snap-start shrink-0 w-[62vw] md:w-[31%]">
                <Skeleton />
              </div>
            ))
          : shown.map((g) => (
              <div
                key={g.key}
                className="snap-start shrink-0 w-[62vw] md:w-[31%] first:rounded-l-xl last:rounded-r-xl md:rounded-xl overflow-hidden"
              >
                <Tile
                  image={cl(
                    `gallery/${g.key}`,
                    "f_auto,q_auto,w_600"
                  )}
                  label={g.label}
                />
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

export function GalleryGrid() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  useEffect(() => {
    fetchGallery()
      .then(setImages)
      .catch(() => setImages([]));
  }, []);

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
      {images.map((g) => (
        <Tile
          key={g.key}
          image={cl(`gallery/${g.key}`, "f_auto,q_auto,w_600")}
          label={g.label}
        />
      ))}
    </div>
  );
}
