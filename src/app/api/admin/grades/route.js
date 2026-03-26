import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { headmasterId, gradeName, sections } = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!headmasterId || !gradeName) {
      return NextResponse.json({ error: "Headmaster ID and Grade Name are required! 🐈" }, { status: 400 });
    }

    // 1. Create Grade
    const gradeRes = await fetch(`${supabaseUrl}/rest/v1/school_grades`, {
      method: "POST",
      headers: { 
        "apikey": supabaseKey, 
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ headmaster_id: headmasterId, name: gradeName })
    });
    const [newGrade] = await gradeRes.json();

    // 2. Create Sections (if any)
    if (sections && sections.length > 0) {
      const sectionPayload = sections.map(s => ({ grade_id: newGrade.id, name: s }));
      await fetch(`${supabaseUrl}/rest/v1/school_sections`, {
        method: "POST",
        headers: { 
          "apikey": supabaseKey, 
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(sectionPayload)
      });
    }

    return NextResponse.json({ success: true, grade: newGrade });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to setup grade! 😿" }, { status: 500 });
  }
}
