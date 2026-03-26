import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const verificationCode = searchParams.get("code");
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!verificationCode) {
      return NextResponse.json({ error: "Verification code required! 🐈" }, { status: 400 });
    }

    // 1. Find the Headmaster associated with the code
    const codeRes = await fetch(`${supabaseUrl}/rest/v1/registration_codes?code=eq.${verificationCode}&select=*`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const codes = await codeRes.json();
    const invite = codes[0];

    if (!invite) {
      return NextResponse.json({ error: "Invalid code! 😿" }, { status: 404 });
    }

    const headmasterId = invite.created_by;

    // 2. Fetch Grades and Sections for this Headmaster
    const gradesRes = await fetch(`${supabaseUrl}/rest/v1/school_grades?headmaster_id=eq.${headmasterId}&select=*,school_sections(*)`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const grades = await gradesRes.json();

    return NextResponse.json(grades);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch grades! 😿" }, { status: 500 });
  }
}
