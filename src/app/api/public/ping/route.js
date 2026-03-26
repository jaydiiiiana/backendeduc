import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const envStatus = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "CONFIGURED ✅" : "MISSING ❌",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? "CONFIGURED ✅" : "MISSING ❌",
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "CONFIGURED ✅" : "MISSING ❌",
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "CONFIGURED ✅" : "MISSING ❌",
  };

  return NextResponse.json({
    status: "Cat Academy Backend is Live! 🐾",
    timestamp: new Date().toISOString(),
    environment: envStatus
  });
}
