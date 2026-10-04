import { NextResponse } from "next/server";

/**
 * Retired. The unpaid-reminder cron was removed (Resend scheduling dropped);
 * this file stays only because the deploy pipeline cannot delete files.
 */
export async function GET() {
  return NextResponse.json({ error: "Gone" }, { status: 410 });
}
