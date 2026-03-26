import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

export async function POST(req) {
  try {
    const { 
      schoolName, 
      contactPerson, 
      contactEmail, 
      contactPhone, 
      preferredDate, 
      preferredTime, 
      meetingType, 
      notes, 
      planName 
    } = await req.json();

    if (!schoolName || !contactPerson || !contactEmail || !contactPhone || !preferredDate || !preferredTime) {
      return NextResponse.json({ error: "Missing required contact or meeting details! 😿" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "risingtechinnovations@gmail.com";

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fafaf9;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">🏛️ New Enrollment Meeting Request</h2>
        <p style="font-size: 16px; color: #475569;">A school has requested an onboarding session via Cat Academy.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <p><strong>🏫 School:</strong> ${schoolName}</p>
          <p><strong>👤 Representative:</strong> ${contactPerson}</p>
          <p><strong>📧 Email:</strong> ${contactEmail}</p>
          <p><strong>📞 Phone:</strong> ${contactPhone}</p>
          <p><strong>💎 Plan Selected:</strong> ${planName || "Trial"}</p>
          <p><strong>📅 Preferred Date:</strong> ${preferredDate}</p>
          <p><strong>🕒 Preferred Time:</strong> ${preferredTime}</p>
          <p><strong>💻 Meeting Type:</strong> ${meetingType}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
          <p><strong>📝 Preparation Notes:</strong></p>
          <p style="font-style: italic;">${notes || "No additional notes provided."}</p>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
          © 2026 Cat Academy Project • Institutional Onboarding System
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: adminEmail,
      subject: `🏛️ Enrollment Request: ${schoolName}`,
      html: htmlContent,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({ success: true, message: "Request received! 🐾" });
  } catch (error) {
    console.error("Enrollment API Error:", error);
    return NextResponse.json({ error: "Failed to process enrollment request! 😿" }, { status: 500 });
  }
}
