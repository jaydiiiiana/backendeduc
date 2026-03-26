import { NextResponse } from "next/server";

// Fetch the headmaster's custom grades and sections
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const headmasterId = searchParams.get("headmasterId");
    
    if (!headmasterId) {
      return NextResponse.json({ error: "Headmaster ID required! 🐈" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

// Sync/Save the entire structure for a Headmaster
export async function POST(req) {
  try {
    const { headmasterId, structure } = await req.json(); // structure: [{ name: "Grade 1", sections: ["S1", "S2"] }, ...]
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!headmasterId || !structure) {
      return NextResponse.json({ error: "Headmaster ID and Structure are required! 🐈" }, { status: 400 });
    }

    // 1. Delete existing structure for this headmaster (Cascade takes care of sections)
    await fetch(`${supabaseUrl}/rest/v1/school_grades?headmaster_id=eq.${headmasterId}`, {
      method: "DELETE",
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });

    // 2. Insert new structure
    for (const item of structure) {
      const gradeRes = await fetch(`${supabaseUrl}/rest/v1/school_grades`, {
        method: "POST",
        headers: { 
          "apikey": supabaseKey, 
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({ headmaster_id: headmasterId, name: item.name })
      });
      const [newGrade] = await gradeRes.json();

      if (item.sections && item.sections.length > 0) {
        const sectionPayload = item.sections.map(s => ({ grade_id: newGrade.id, name: s }));
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to sync structure! 😿" }, { status: 500 });
  }
}
