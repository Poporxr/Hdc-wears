"use client";

import { useEffect } from "react";
import { cl } from "@/lib/db";

const COLORS = ["red", "black", "green", "blue"];

/** All site imagery, constructed deterministically from Cloudinary. */
export function allSiteImages(): string[] {
  const urls: string[] = [];
  for (const c of COLORS) {
    urls.push(cl(`hero/${c}-mobile`, "f_auto,q_auto,w_600"));
    urls.push(cl(`hero/${c}-desktop`, "f_auto,q_auto,w_1000"));
    urls.push(cl(`products/${c}-front`, "f_auto,q_auto,w_800"));
    urls.push(cl(`products/${c}-back`, "f_auto,q_auto,w_800"));
    urls.push(cl(`gallery/${c}`, "f_auto,q_auto,w_600"));
  }
  return urls;
}

/**
 * Aggressively warms the browser cache: after the page is interactive,
 * every site image is fetched once so repeat views and navigation never
 * refetch. Cloudinary serves 30-day cache headers, so the browser keeps
 * them without revalidating.
 */
export default function ImagePreloader() {
  useEffect(() => {
    let cancelled = false;
    const warm = () => {
      if (cancelled) return;
      for (const src of allSiteImages()) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      }
    };
    if ("requestIdleCallback" in window) {
      const id = (window as unknown as {
        requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
      }).requestIdleCallback(warm, { timeout: 4000 });
      return () => {
        cancelled = true;
        (
          window as unknown as { cancelIdleCallback: (id: number) => void }
        ).cancelIdleCallback(id);
      };
    }
    const t = setTimeout(warm, 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);
  return null;
}
