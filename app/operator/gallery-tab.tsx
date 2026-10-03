"use client";

import { useEffect, useState } from "react";
import { fetchGallery, cl, type GalleryImage } from "@/lib/db";
import { deleteGalleryImage } from "@/lib/admin";
import { useToast } from "@/components/toast";

export default function GalleryTab() {
  const toast = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchGallery()
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (key: string) => {
    if (!confirm(`Remove "${key}" from the gallery?`)) return;
    try {
      await deleteGalleryImage(key);
      setImages((prev) => prev.filter((g) => g.key !== key));
      toast({ title: "Removed from gallery", description: key, variant: "info" });
    } catch {
      toast({ title: "Remove failed", variant: "error" });
    }
  };

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading gallery...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-2">
        GALLERY ({images.length})
      </h2>
      <p className="text-neutral-500 text-xs mb-6">
        These power the HDC WORLD strip and /gallery page. Upload new shots to
        Cloudinary under hdc-wears/gallery/, then add the doc in Firestore.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((g) => (
          <div
            key={g.key}
            className="relative group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden aspect-[4/5]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cl(`gallery/${g.key}`, "f_auto,q_auto,w_400")}
              alt={g.label}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => remove(g.key)}
              className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              REMOVE
            </button>
            <p className="absolute bottom-0 inset-x-0 bg-black/60 text-[11px] px-2 py-1.5 truncate">
              {g.key}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
