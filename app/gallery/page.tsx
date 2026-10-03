import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { GalleryGrid } from "@/components/GallerySection";

export default function GalleryPage() {
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
        <GalleryGrid />
      </main>
      <SiteFooter />
    </div>
  );
}
