"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { cl } from "@/lib/db";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </div>
  );
}

function HeroWord({ word, i }: { word: string; i: number }) {
  return (
    <span className="inline-block overflow-hidden pb-1 -mb-1 align-bottom">
      <span
        className="inline-block animate-rise-in"
        style={{ animationDelay: `${0.15 + i * 0.09}s` }}
      >
        {word}
      </span>
    </span>
  );
}

const PILLARS = [
  {
    title: "AMBITION",
    copy: "Refuse to settle. Every piece is cut for the version of you that is still becoming.",
  },
  {
    title: "RESILIENCE",
    copy: "Built from humble beginnings, worn with the confidence of someone destined for more.",
  },
  {
    title: "COURAGE",
    copy: "Dream loudly. The world expects small. We never listened.",
  },
];

const CHAPTERS = [
  {
    n: "01",
    title: "THE ROOTS",
    copy: "I grew up surrounded by style and creativity. Both of my parents are tailors, and the aunt who raised me was a tailor too. Fashion was not something I discovered later. It was always part of my environment, my identity, and the way I understood self-expression and confidence.",
    img: cl("gallery/tank-mannequin-crimson-front-cropped.jpg", "f_auto,q_auto,w_800"),
  },
  {
    n: "02",
    title: "THE QUESTION",
    copy: "As I got older, I noticed something. Most of the clothes I wore were counterfeits of popular international brands, while many original Nigerian brands felt financially out of reach for someone like me. That planted a question in my mind: why not create something of my own?",
  },
  {
    n: "03",
    title: "THE SPARK",
    copy: "Then I heard a Virgil Abloh interview. He said anyone who thinks Off-White is too expensive should start their own brand. Later, his advice to \u201csell yourself\u201d hit different. I started thinking seriously about who I am and what I represent.",
    img: cl("gallery/tank-mannequin-black-front-cropped.jpg", "f_auto,q_auto,w_800"),
  },
  {
    n: "04",
    title: "THE NAME",
    copy: "I have always chased a bigger life, refusing to settle for less even when the odds were against me. HDC is that mindset with a name. High Dream Chasers stands for ambition, resilience, and the courage to dream loudly even when the world expects you to stay small.",
  },
];

const MARQUEE = Array(8).fill("HIGH DREAM CHASERS");

export default function BrandStoryClient() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 font-display font-black text-[38vw] leading-none text-white/[0.04] select-none"
        >
          HDC
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-28 pb-16 md:pb-24">
          <p className="animate-rise-in text-[11px] md:text-xs font-bold tracking-[0.4em] text-white/50 mb-6">
            THE HDC STORY
          </p>
          <h1 className="font-display font-black leading-[0.95] tracking-tight text-[13.5vw] md:text-[9vw]">
            {["BUILT", "FROM", "AMBITION,"].map((w, i) => (
              <HeroWord key={w} word={w} i={i} />
            ))}
            <br />
            {["RAISED", "BY", "CRAFT."].map((w, i) => (
              <HeroWord key={w} word={w} i={i + 3} />
            ))}
          </h1>
          <p
            className="animate-rise-in mt-8 max-w-xl text-white/60 text-base md:text-lg leading-relaxed"
            style={{ animationDelay: "0.9s" }}
          >
            HDC is not just a clothing label. It is the expression of a
            mindset shaped by tailoring, self-belief, and the refusal to stay
            small.
          </p>
          <div
            className="animate-rise-in mt-10 flex items-center gap-3 text-white/40 text-xs tracking-[0.3em] font-bold"
            style={{ animationDelay: "1.1s" }}
          >
            <span className="inline-block w-10 h-px bg-white/40" />
            SCROLL FOR THE STORY
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-white/10 py-4 overflow-hidden bg-black">
        <div className="animate-marquee flex whitespace-nowrap w-max">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0">
              {MARQUEE.map((t, i) => (
                <span
                  key={i}
                  className="font-display font-black text-2xl md:text-4xl tracking-tight mx-6 text-outline"
                >
                  {t}
                  <span className="text-white/60 mx-6">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MEANING */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <Reveal>
          <p className="text-[11px] font-bold tracking-[0.4em] text-white/50 mb-6">
            THE MEANING
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display font-black text-5xl md:text-8xl tracking-tight leading-[0.95]">
            HIGH DREAM
            <br />
            <span className="text-outline">CHASERS</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 max-w-2xl text-white/60 text-base md:text-lg leading-relaxed">
            Ambition, resilience, and the courage to dream loudly even when the
            world expects you to stay small. More than clothing. A mindset for
            every dreamer chasing a higher version of themselves.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="group border border-white/10 rounded-2xl p-7 h-full bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/25 hover:-translate-y-1.5 transition-all duration-300">
                <p className="font-display font-black text-4xl text-white/15 group-hover:text-white/30 transition-colors">
                  0{i + 1}
                </p>
                <h3 className="font-display font-black text-2xl tracking-tight mt-4">
                  {p.title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mt-3">
                  {p.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CHAPTERS */}
      <section className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.4em] text-black/50 mb-4">
              HOW IT STARTED
            </p>
            <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight">
              THE STORY, IN CHAPTERS
            </h2>
          </Reveal>

          <div className="mt-14 space-y-16 md:space-y-24">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.n}
                className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Reveal>
                  {c.img ? (
                    <div className="relative overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/5] group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.img}
                        alt={c.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute bottom-4 left-4 bg-black text-white text-[10px] font-bold tracking-[0.3em] px-3 py-2 rounded-full">
                        CHAPTER {c.n}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-black text-white aspect-[4/5] md:aspect-auto md:min-h-[420px] flex flex-col justify-between p-8 md:p-10 overflow-hidden relative">
                      <span
                        aria-hidden
                        className="absolute -bottom-8 -right-4 font-display font-black text-[11rem] leading-none text-white/[0.06] select-none"
                      >
                        {c.n}
                      </span>
                      <p className="text-[10px] font-bold tracking-[0.3em] text-white/50">
                        CHAPTER {c.n}
                      </p>
                      <p className="font-display font-black text-3xl md:text-4xl leading-tight relative">
                        {c.title === "THE QUESTION"
                          ? "\u201cWhy not create something of my own?\u201d"
                          : "\u201cSell yourself.\u201d"}
                      </p>
                    </div>
                  )}
                </Reveal>
                <Reveal delay={120}>
                  <p className="font-display font-black text-6xl md:text-7xl text-black/10">
                    {c.n}
                  </p>
                  <h3 className="font-display font-black text-3xl md:text-4xl tracking-tight mt-2">
                    {c.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mt-5 text-[15px] md:text-base">
                    {c.copy}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMISE */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32 text-center">
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.4em] text-white/50 mb-6">
              THE BRAND PROMISE
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display font-black tracking-tight leading-[0.95] text-5xl md:text-8xl">
              MORE THAN A BRAND.
              <br />
              A WAY OF LIFE.
              <br />
              <span className="text-outline">A MINDSET.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-8 max-w-2xl mx-auto text-white/60 leading-relaxed">
              High Dream Chasers is for those who refuse to settle, who believe
              their dreams are valid, and who are ready to chase the best life
              possible. We stand for ambition, growth, and bold living. If you
              are driven to rise higher, think bigger, and become more, you are
              one of us.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/category/clothing"
                className="bg-white text-black font-black text-sm tracking-[0.2em] px-10 py-4 rounded-full hover:scale-105 hover:bg-neutral-200 transition-all"
              >
                SHOP THE DROP
              </Link>
              <Link
                href="/gallery"
                className="border border-white/25 text-white font-black text-sm tracking-[0.2em] px-10 py-4 rounded-full hover:bg-white/10 transition-all"
              >
                VIEW GALLERY
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
