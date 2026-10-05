import { ImageResponse } from "next/og";
import { getSeoProduct, naira, SITE_NAME } from "@/lib/seo";

export const runtime = "edge";
export const alt = "HDC Wears product";
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
  const p = await getSeoProduct(slug);
  const display = anton ? "Anton" : "Arial Black, sans-serif";

  const name = p?.name || "HDC Piece";
  const price = p ? naira(p.price) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#000",
          color: "#fff",
          fontFamily: display,
        }}
      >
        {/* Product shot */}
        <div
          style={{
            width: "46%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            overflow: "hidden",
          }}
        >
          {p?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 120 }}>HDC</div>
          )}
        </div>

        {/* Copy */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: "10px",
              color: "#888",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            {SITE_NAME.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginTop: 16,
            }}
          >
            {name}
          </div>
          {price && (
            <div style={{ fontSize: 54, marginTop: 20, color: "#fff" }}>
              {price}
            </div>
          )}
          <div
            style={{
              marginTop: 28,
              fontSize: 22,
              fontFamily: "Helvetica, Arial, sans-serif",
              color: "#999",
            }}
          >
            {p?.inStock === false ? "Out of stock" : "In stock · Ships in Nigeria"}
          </div>
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
