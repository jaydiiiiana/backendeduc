import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const stories = [
    {
      id: "1",
      name: "St. Mary Academic",
      location: "Quezon City",
      story: "Transformed from paper-based to 100% digital in just 3 months. Student engagement increased by 40% using the gamified quiz system.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "2",
      name: "Green Valley High",
      location: "Cebu",
      story: "The automated grading and analytics helped our teachers save 10 hours a week, allowing them to focus more on personalized student guidance.",
      image: "https://images.unsplash.com/photo-1523050853063-bd388f9f79b5?auto=format&fit=crop&w=400&q=80"
    }
  ];

  return NextResponse.json(stories);
}
