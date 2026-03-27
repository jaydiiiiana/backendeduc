import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, rating, comment } = await req.json();

    if (!userId || !rating) {
      return NextResponse.json({ error: "User ID and Rating are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ratings")
      .upsert({ user_id: userId, rating, comment }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
