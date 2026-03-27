import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ratings")
      .select("*, users(name, nickname, role, school)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate metadata
    const count = data.length;
    const average = count > 0 
      ? Number((data.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
      : 0;

    return NextResponse.json({
      average,
      count,
      ratings: data.map(r => ({
        id: r.id,
        user: r.users?.nickname || r.users?.name || "Anonymous Scholar",
        role: r.users?.role || "Faculty",
        school: r.users?.school || "Cat Academy",
        rating: r.rating,
        comment: r.comment,
        date: r.created_at
      }))
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

