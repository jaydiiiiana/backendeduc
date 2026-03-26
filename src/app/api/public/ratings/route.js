import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const ratings = [
    {
      id: "1",
      user: "Principal Santos",
      role: "Headmaster",
      rating: 5,
      comment: "The best investment our school has made in years. The transition was seamless.",
      date: "2026-03-24"
    },
    {
      id: "2",
      user: "Teacher Maria",
      role: "Faculty",
      rating: 5,
      comment: "I love the quick quiz creation tool. It saves me so much time every day!",
      date: "2026-03-25"
    }
  ];

  return NextResponse.json(ratings);
}
