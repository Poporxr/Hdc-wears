"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Client shoot frames (preview data — local files under /preview)   */
/* ------------------------------------------------------------------ */

export type Frame = {
  src: string;
  title: string;
  sub: string;
  cls: string; // campaign grid placement classes
  imgCls: string;
};

const CAMPAIGN: Frame[] = [
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2373.jpg",
    title: "STUDIO, BLACK TEE",
    sub: "FRONT — STUDIO",
    cls: "col-span-2 md:col-span-5",
    imgCls: "aspect-[3/4]",
  },
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2233.jpg",
    title: "THE SHOP, BLUE TEE",
    sub: "FRONT + BACK — IN STORE",
    cls: "md:col-span-4 md:mt-24",
    imgCls: "aspect-[3/4]",
  },
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2356.jpg",
    title: "STUDIO, BLACK + GREEN",
    sub: "BACK + FRONT — STUDIO",
    cls: "md:col-span-3 md:mt-44",
    imgCls: "aspect-[3/4]",
  },
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2283.jpg",
    title: "THE SHOP, GREEN TEE",
    sub: "FRONT + BACK — IN STORE",
    cls: "col-span-2 md:col-span-4 w-[86%] justify-self-end md:w-auto md:justify-self-auto",
    imgCls: "aspect-[3/4]",
  },
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2366.jpg",
    title: "STUDIO, GREEN BACK",
    sub: "DETAIL — STUDIO",
    cls: "col-span-2 md:col-span-4 w-[86%] md:w-auto md:mt-20 gv-rot",
    imgCls: "aspect-[3/4]",
  },
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2249.jpg",
    title: "THE SHOP, PURPLE TEE",
    sub: "BACK — IN STORE",
    cls: "md:col-span-4 md:mt-40",
    imgCls: "aspect-[3/4]",
  },
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2415.jpg",
    title: "STUDIO, BLACK + BLUE",
    sub: "FRONTS — STUDIO",
    cls: "md:col-span-6",
    imgCls: "aspect-[3/4] md:aspect-[16/11]",
  },
  {
    src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2286.jpg",
    title: "NIGHT, GREEN TEE",
    sub: "STREET — NIGHT",
    cls: "col-span-2 md:col-span-6 md:mt-24",
    imgCls: "aspect-[3/4] md:aspect-[16/11]",
  },
];

const DISPLAY: Frame[] = [
  { src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2306.jpg", title: "PURPLE + GREEN", sub: "STUDIO", cls: "", imgCls: "aspect-[3/4]" },
  { src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2465.jpg", title: "PURPLE + BLUE, FRONTS", sub: "STUDIO", cls: "", imgCls: "aspect-[3/4]" },
  { src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2474.jpg", title: "PURPLE, FULL SET", sub: "STUDIO", cls: "", imgCls: "aspect-[3/4]" },
  { src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2349.jpg", title: "GREEN, CARRY OUT", sub: "STUDIO", cls: "", imgCls: "aspect-[3/4]" },
];

const UPCLOSE: Frame[] = [
  { src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2430.jpg", title: "BLUE TEE, FRONT FIT", sub: "STUDIO", cls: "", imgCls: "aspect-[3/4]" },
  { src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2263.jpg", title: "BLACK TEE PAIR, THE SHOP", sub: "FRONT + BACK — IN STORE", cls: "", imgCls: "aspect-[3/4]" },
];

const WIDE: Frame = {
  src: "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2399.jpg",
  title: "BLACK TEE, BACK PRINT FLAT",
  sub: "STILL LIFE — STUDIO",
  cls: "",
  imgCls: "aspect-[4/5] md:aspect-[16/8]",
};

const ALL: Frame[] = [...CAMPAIGN, ...DISPLAY, WIDE, ...UPCLOSE];
const OPENER_FRAMES = [
  "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2383.jpg",
  "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2306.jpg",
  "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2430.jpg",
  "https://res.cloudinary.com/doc3mb9if/image/upload/f_auto,q_auto,w_1400/hdc-wears/shoot/IMG_2349.jpg",
];

const pad = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/*  Scroll reveal wrapper                                              */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && el.classList.add("gv-in")),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`gv-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Opener                                                             */
/* ------------------------------------------------------------------ */

function Opener() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("still")) return;
    const t = setInterval(() => setI((v) => (v + 1) % OPENER_FRAMES.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="border-b border-neutral-900">
      <div className="grid md:grid-cols-2">
        <div className="px-4 md:px-8 pt-10 md:pt-16 pb-10 flex flex-col justify-between max-w-2xl">
          <div>
            <h1 className="font-display font-black leading-[0.9] tracking-tight text-6xl md:text-8xl">
              HDC
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "2px #0a0a0a" }}>
                WORLD
              </span>
            </h1>
            <p className="text-neutral-600 text-sm md:text-[15px] leading-relaxed max-w-md mt-6">
              An editorial study of the Bandana Series, worn as it was meant to be
              worn. Photographed in studio and on location, on the people who make
              the brand what it is.
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden border-t md:border-t-0 md:border-l border-neutral-900 min-h-[420px] md:min-h-[560px]">
          <div key={i} className="absolute inset-0 animate-hero-in-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={OPENER_FRAMES[i]}
              alt="HDC World opener frame"
              className="w-full h-full object-cover gv-zoom"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-between items-end px-5 py-4 text-white bg-gradient-to-t from-black/60 to-transparent">
            <span className="text-[11px] font-bold tracking-[0.25em]">THE BANDANA SERIES — LIVE ROTATION</span>
            <span className="text-[11px] tracking-[0.2em]">{pad(i + 1)} / {pad(OPENER_FRAMES.length)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee                                                            */
/* ------------------------------------------------------------------ */

function Marquee({ dark = true, items }: { dark?: boolean; items: string[] }) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span
          key={i}
          className={`mx-5 font-display font-black tracking-wide text-lg whitespace-nowrap ${
            i % 2 === 1 ? "text-transparent" : ""
          }`}
          style={i % 2 === 1 ? { WebkitTextStroke: `1.2px ${dark ? "#fff" : "#0a0a0a"}` } : undefined}
        >
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden py-3 ${dark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900 border-b border-neutral-900"}`}>
      <div className="flex w-max animate-marquee">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading (site style)                                       */
/* ------------------------------------------------------------------ */

function SectionHead({ no, eyebrow, title, note, dark = false }: { no: string; eyebrow: string; title: string; note: string; dark?: boolean }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
      <div>
        <p className={`text-xs font-bold tracking-[0.25em] mb-2 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>
          {no} / {eyebrow}
        </p>
        <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight">{title}</h2>
      </div>
      <p className={`text-[13px] leading-relaxed max-w-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>{note}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lightbox overview                                                  */
/* ------------------------------------------------------------------ */

function Lightbox({ index, setIndex, close }: { index: number | null; setIndex: (i: number) => void; close: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const cur = index ?? 0;

  useEffect(() => {
    if (open && stageRef.current) {
      stageRef.current.scrollLeft = cur * stageRef.current.clientWidth;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  if (!open) return null;

  const go = (i: number) => {
    const n = Math.max(0, Math.min(ALL.length - 1, i));
    setIndex(n);
    stageRef.current?.scrollTo({ left: n * stageRef.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#fdfdfd] flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-neutral-200">
        <span className="text-xs font-bold tracking-[0.25em]">HDC WORLD — OVERVIEW</span>
        <button onClick={close} className="text-xs font-bold tracking-[0.2em] border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors">
          CLOSE ✕
        </button>
      </div>

      <div
        ref={stageRef}
        onScroll={() => {
          const el = stageRef.current;
          if (!el) return;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== cur && i >= 0 && i < ALL.length) setIndex(i);
        }}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ALL.map((f) => (
          <div key={f.src} className="flex-[0_0_100%] snap-center flex items-center justify-center bg-[#f4f4f4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt={f.title} className="max-w-full max-h-full object-contain" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 md:px-8 pt-3">
        <button onClick={() => go(cur - 1)} className={`text-xs font-bold tracking-[0.25em] ${cur === 0 ? "text-neutral-300" : ""}`}>
          ‹ PREV
        </button>
        <button onClick={() => go(cur + 1)} className={`text-xs font-bold tracking-[0.25em] ${cur === ALL.length - 1 ? "text-neutral-300" : ""}`}>
          NEXT ›
        </button>
      </div>
      <div className="text-center px-4 pt-2">
        <p className="font-mono text-[11px] tracking-[0.25em] text-neutral-400">
          FRAME {pad(cur + 1)} / {pad(ALL.length)}
        </p>
        <p className="font-display font-black tracking-wide text-lg mt-1">{ALL[cur].title}</p>
        <p className="text-[11px] tracking-[0.2em] text-neutral-500 mt-0.5">{ALL[cur].sub}</p>
      </div>

      <div className="flex gap-2 md:gap-2.5 overflow-x-auto px-4 md:px-8 py-3 md:py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ALL.map((f, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={f.src}
            src={f.src}
            alt={f.title}
            onClick={() => go(i)}
            className={`w-10 h-[52px] md:w-14 md:h-[72px] object-cover cursor-pointer flex-none border-2 transition-opacity ${
              i === cur ? "border-neutral-900 opacity-100" : "border-transparent opacity-40 hover:opacity-75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery experience (page body)                                     */
/* ------------------------------------------------------------------ */

export default function GalleryExperience() {
  const [lb, setLb] = useState<number | null>(null);

  // Preview capture support: /gallery?lb=N opens the overview at frame N; ?still freezes motion
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("still")) document.documentElement.classList.add("still");
    const n = params.get("lb");
    if (n !== null) setLb(Math.max(0, Math.min(ALL.length - 1, parseInt(n, 10) || 0)));
  }, []);

  const tile = (f: Frame, globalIndex: number, extra = "") => (
    <button key={f.src} onClick={() => setLb(globalIndex)} className={`block text-left w-full ${extra}`}>
      <div className={`relative overflow-hidden bg-[#f1f2f5] ${f.imgCls}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={f.src}
          alt={f.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05]"
        />
      </div>
      <p className="font-mono text-[10.5px] tracking-[0.25em] text-neutral-400 pt-2.5">
        FRAME {pad(globalIndex + 1)}
      </p>
    </button>
  );

  return (
    <>
      <Opener />
      <Marquee items={["HIGH DREAM CHASERS", "HDC WORLD", "THE BANDANA SERIES", "VOL. 01 — EDITORIAL", "HIGH DREAM CHASERS", "HDC WORLD", "THE BANDANA SERIES", "VOL. 01 — EDITORIAL"]} />

      {/* THE CAMPAIGN */}
      <section className="px-4 md:px-8 max-w-[1440px] mx-auto pt-14 md:pt-20 pb-4">
        <SectionHead
          no="01"
          eyebrow="EDITORIAL"
          title="THE CAMPAIGN"
          note="The shoot, laid out like a magazine spread. Big frames, breathing room, nothing fighting for attention."
        />
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-16">
          {CAMPAIGN.map((f, i) => (
            <Reveal key={f.src} className={`${f.cls}`} delay={(i % 3) * 90}>
              {tile(f, i)}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ON DISPLAY */}
      <section className="bg-neutral-950 text-white mt-16 md:mt-24 px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-[1440px] mx-auto">
          <SectionHead
            dark
            no="02"
            eyebrow="ON DISPLAY"
            title="ON DISPLAY"
            note="The colourways, side by side. Shot clean in studio so the print does the talking."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {DISPLAY.map((f, i) => (
              <Reveal key={f.src} delay={i * 90}>
                {tile(f, CAMPAIGN.length + i)}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Marquee dark={false} items={["UP CLOSE", "THE PRINT, THE FIT", "UP CLOSE", "THE PRINT, THE FIT", "UP CLOSE", "THE PRINT, THE FIT", "UP CLOSE", "THE PRINT, THE FIT"]} />

      {/* UP CLOSE */}
      <section className="px-4 md:px-8 max-w-[1440px] mx-auto pt-14 md:pt-20 pb-16">
        <SectionHead
          no="03"
          eyebrow="PRODUCT NOTES"
          title="UP CLOSE"
          note="Print detail and fit, the frames that answer a buyer's questions before they ask."
        />
        <Reveal>
          {tile(WIDE, CAMPAIGN.length + DISPLAY.length)}
        </Reveal>
        <div className="grid grid-cols-2 gap-3 md:gap-5 mt-3 md:mt-5">
          {UPCLOSE.map((f, i) => (
            <Reveal key={f.src} delay={i * 90}>
              {tile(f, CAMPAIGN.length + DISPLAY.length + 1 + i)}
            </Reveal>
          ))}
        </div>
        <div className="border border-neutral-900 px-5 py-4 mt-10 flex flex-col md:flex-row md:items-center justify-between gap-1.5">
          <p className="font-bold text-sm tracking-wide">THE BANDANA SERIES — VOL. 01</p>
          <p className="text-[11px] tracking-[0.2em] text-neutral-500">PHOTOGRAPHED IN STUDIO AND ON LOCATION</p>
        </div>
      </section>

      <Lightbox index={lb} setIndex={setLb} close={() => setLb(null)} />
    </>
  );
}
