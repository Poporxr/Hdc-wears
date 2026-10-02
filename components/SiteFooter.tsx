import Link from "next/link";

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconTiktok() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-detta-navy text-white rounded-t-3xl mt-16">
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-black text-sm">
            DW
          </span>
          <span className="font-black tracking-[0.25em] text-lg">DETTAWEARS</span>
        </div>
        <p className="text-white/80 text-sm leading-relaxed max-w-md">
          Quality everyday pieces designed for comfort, confidence, and clean
          personal style, from daily essentials to custom looks made to feel
          like yours.
        </p>

        <p className="font-bold text-sm tracking-wide mt-8 mb-3">FOLLOW US</p>
        <div className="flex gap-3">
          {[IconInstagram, IconTiktok, IconX].map((Icon, i) => (
            <a
              key={i}
              href="#"
              aria-label="Social link"
              className="w-11 h-11 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10"
            >
              <Icon />
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10 text-sm">
          <div>
            <p className="font-bold tracking-wide mb-4">ABOUT</p>
            <ul className="space-y-3 text-white/70">
              <li><Link href="/contact" className="hover:text-white">CONTACT</Link></li>
              <li><Link href="/about" className="hover:text-white">ABOUT</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold tracking-wide mb-4">FAQ</p>
            <ul className="space-y-3 text-white/70">
              <li><Link href="/privacy" className="hover:text-white">PRIVACY</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-10">
          © 2026 Dettawears. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
