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

    // 1. Find the code details
    const codeRes = await fetch(`${supabaseUrl}/rest/v1/registration_codes?code=eq.${verificationCode}&select=*`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const codes = await codeRes.json();
    const invite = codes[0];

    if (!invite) {
      return NextResponse.json({ error: "Invalid code! 😿" }, { status: 404 });
    }

    // 2. Resolve the Headmaster ID (The owner of the school structure)
    const creatorId = invite.created_by;
    const creatorRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${creatorId}&select=id,role,invited_by`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const [creator] = await creatorRes.json();
    
    if (!creator) {
      return NextResponse.json({ error: "Code creator not found! 😿" }, { status: 404 });
    }

    let headmasterId = creator.id;
    if (creator.role === 'Teacher') {
      headmasterId = creator.invited_by; // Teachers are invited by Headmasters
    }

    // 3. Fetch Grades and Sections for this Headmaster
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
