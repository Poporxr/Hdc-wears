import { ImageResponse } from "next/og";
import { getCategory } from "@/lib/products";
import { SITE_NAME } from "@/lib/seo";

export const runtime = "edge";
export const alt = "HDC Wears category";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      "https://fonts.googleapis.com/css2?family=Anton&display=swap"
    );
    const css = await res.text();
    const url = css.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) return null;
    const font = await fetch(url);
    return await font.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const anton = await loadFont();
  const category = getCategory(slug);
  const label = (category ? category.label : "SHOP").toUpperCase();
  const display = anton ? "Anton" : "Arial Black, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
          color: "#fff",
          fontFamily: display,
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: "12px",
            color: "#888",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          {SITE_NAME.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            letterSpacing: "-3px",
            lineHeight: 1.1,
            marginTop: 12,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 24,
            color: "#999",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          High Dream Chasers · Benue, Nigeria
        </div>
      </div>
    ),
    {
      ...size,
      ...(anton
        ? { fonts: [{ name: "Anton", data: anton, weight: 400 as const }] }
        : {}),
    }
  );
}
