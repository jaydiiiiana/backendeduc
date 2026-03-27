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

    // 1b. Get Creator's role to verify authority
    const creatorRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${invite.created_by}&select=role`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const creators = await creatorRes.json();
    const creatorRole = creators[0]?.role || "Unknown";

    // 2. Resolve the School Structure owner (Hierarchical Lookup)
    let currentId = invite.created_by;
    let finalGrades = [];
    let hops = 0;

    while (hops < 3) {
      console.log(`[GradeFetch] Checking structure for UserID: ${currentId} (Hop ${hops})`);
      const res = await fetch(`${supabaseUrl}/rest/v1/school_grades?headmaster_id=eq.${currentId}&select=*,school_sections(*)`, {
        headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          finalGrades = data;
          console.log(`[GradeFetch] Found ${data.length} grades for ID: ${currentId}`);
          break;
        }
      }

      // If no grades found at this level, move up the chain
      const userRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${currentId}&select=invited_by`, {
        headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
      });
      const userData = await userRes.json();
      const user = Array.isArray(userData) ? userData[0] : userData;
      
      if (!user || !user.invited_by) {
        console.log(`[GradeFetch] No parent found for ID: ${currentId}. Stopping.`);
        break;
      }
      
      currentId = user.invited_by;
      hops++;
    }

    return NextResponse.json({ 
      grades: finalGrades, 
      role_to_grant: invite.role_to_grant,
      creator_role: creatorRole
    });
  } catch (error) {
    console.error("[GradeFetch] Critical Error:", error);
    return NextResponse.json({ error: "Failed to fetch grades! 😿" }, { status: 500 });
  }
}
