import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HDC Wears — High Dream Chasers";
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

export default async function OgImage() {
  const anton = await loadFont();

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
          fontFamily: anton ? "Anton" : "Arial Black, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: "-4px",
            lineHeight: 1,
          }}
        >
          HDC
        </div>
        <div
          style={{
            fontSize: 34,
            letterSpacing: "18px",
            marginTop: 8,
            color: "#fff",
          }}
        >
          — WEARS —
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 36,
            color: "#999",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          High Dream Chasers · Lagos, Nigeria
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
