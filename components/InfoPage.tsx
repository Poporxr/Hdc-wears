import type { ReactNode } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export default function InfoPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl tracking-tight mb-6">
          {title}
        </h1>
        <div className="prose-sm text-neutral-600 leading-relaxed space-y-4">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
