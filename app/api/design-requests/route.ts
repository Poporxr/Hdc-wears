import { NextResponse } from "next/server";
import { fsAdd } from "@/lib/firebase-admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const GARMENTS = ["Tee", "Tank Top", "Cap", "Hoodie", "Crewneck", "Other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

/** Public custom-design submissions. Validated + rate-limited server-side,
 *  written with the service account — clients never write design_requests
 *  directly, so no login is required to file a request. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`design-request:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return bad("Too many requests. Please try again later.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.");
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const garment = String(body.garment || "").trim();
  const description = String(body.description || "").trim();
  const imageUrl = String(body.imageUrl || "").trim();

  if (name.length < 2 || name.length > 80) return bad("Please enter your name.");
  if (!EMAIL_RE.test(email) || email.length > 120) return bad("Please enter a valid email.");
  if (phone.length < 5 || phone.length > 30) return bad("Please enter a valid phone number.");
  if (!GARMENTS.includes(garment)) return bad("Please pick a garment type.");
  if (description.length < 10 || description.length > 3000)
    return bad("Please describe your design (10+ characters).");
  if (imageUrl && !/^https:\/\/res\.cloudinary\.com\/doc3mb9if\/image\/upload\//.test(imageUrl))
    return bad("Invalid reference image.");

  try {
    const id = await fsAdd("design_requests", {
      name,
      email,
      phone,
      garment,
      description,
      imageUrl: imageUrl || null,
      status: "new",
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[design-requests] submit FAILED:", err);
    return bad("Could not save your request. Please try again.", 500);
  }
}
