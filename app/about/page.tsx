import InfoPage from "@/components/InfoPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind High Dream Chasers — HDC Wears, Lagos Nigeria streetwear.",
};

export default function AboutPage() {
  return (
    <InfoPage title="ABOUT HDC WEARS">
      <p>
        HDC — <strong>High Dream Chasers</strong> — is a Nigeria-based
        streetwear label making quality everyday pieces designed for comfort,
        confidence, and clean personal style — from daily essentials to
        custom looks made to feel like yours.
      </p>
      <p>
        Every drop is designed in-house and produced in limited runs. When a
        piece sells out, it&apos;s gone — that&apos;s what keeps the
        community coming back.
      </p>
      <p>
        This is a demo storefront replica. Real brand story goes here.
      </p>
    </InfoPage>
  );
}
