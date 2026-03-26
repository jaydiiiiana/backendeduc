import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("success_stories")
      .select("*, users(name)")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json([]); // Empty results
      throw error;
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { content, authorId } = await req.json();

    if (!content || !authorId) {
      return NextResponse.json({ error: "Content and Author ID are required." }, { status: 400 });
    }

    // Verify Headmaster role
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authorId)
      .single();

    if (userError || !user || user.role !== "Headmaster") {
      return NextResponse.json({ error: "Only Headmasters can post success stories." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("success_stories")
      .insert([{ content, author_id: authorId }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { storyId, action } = await req.json(); // action: 'like'
    
    if (action === 'like') {
      const { data, error } = await supabase.rpc('increment_likes', { story_id: storyId });
      // If RPC doesn't exist, fallback to manual update (less atomic but works)
      if (error) {
        const { data: currentStory } = await supabase.from("success_stories").select("likes").eq("id", storyId).single();
        const { data: updated, error: upError } = await supabase
          .from("success_stories")
          .update({ likes: (currentStory?.likes || 0) + 1 })
          .eq("id", storyId)
          .select()
          .single();
        if (upError) throw upError;
        return NextResponse.json(updated);
      }
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
