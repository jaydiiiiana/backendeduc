import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("website_ratings")
      .select("rating");

    if (error) throw error;

    if (data.length === 0) {
      return NextResponse.json({ average: 0, count: 0 });
    }

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (sum / data.length).toFixed(1);

    return NextResponse.json({ average: parseFloat(average), count: data.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, rating } = await req.json();

    if (!userId || !rating) {
      return NextResponse.json({ error: "User ID and Rating are required." }, { status: 400 });
    }

    // Upsert rating (one per user)
    const { data, error } = await supabase
      .from("website_ratings")
      .upsert({ user_id: userId, rating }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
