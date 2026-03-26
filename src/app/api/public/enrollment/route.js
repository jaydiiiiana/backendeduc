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

    const adminEmail = process.env.ADMIN_EMAIL || "jaydiiii331@gmail.com";

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder') {
      console.error("Missing RESEND_API_KEY!");
      return NextResponse.json({ error: "Email service is not configured (Missing API Key). Please check Render environment variables." }, { status: 501 });
    }

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fafaf9; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: #1e40af; padding: 40px 20px; text-align: center; color: white;">
          <p style="font-size: 10px; font-weight: 800; opacity: 0.8; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 3px;">Institutional Onboarding</p>
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase;">Enrollment Request</h1>
        </div>
        
        <div style="padding: 40px; background-color: white;">
          <p style="color: #64748b; margin-bottom: 30px; font-weight: 500;">A new institution has requested an academic onboarding session. Below are the registered details:</p>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Institution Name</div>
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${schoolName}</div>
            </div>
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Contact Representative</div>
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${contactPerson}</div>
            </div>
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Contact Info</div>
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">Email: ${contactEmail} | Phone: ${contactPhone}</div>
            </div>
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Academic Tier</div>
              <div style="display: inline-block; background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 900; text-transform: uppercase;">${planName || "Trial"}</div>
            </div>
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Meeting Schedule</div>
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${preferredDate} at ${preferredTime}</div>
            </div>
            <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Platform Environment</div>
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${meetingType === 'Zoom' ? '💻 Online Conference (Zoom)' : '🤝 Personal Consultation'}</div>
            </div>
          </div>

          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <div style="font-size: 10px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Preparation & Requirements</div>
            <div style="font-size: 16px; font-style: italic; color: #92400e; font-weight: 500;">"${notes || "None provided."}"</div>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          <p><strong>Cat Academy Project</strong> • Advanced Learning Management</p>
          <p style="margin-top: 5px;">This is an automated institutional notification.</p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: adminEmail,
      subject: `🏛️ Enrollment Request: ${schoolName}`,
      html: htmlContent,
    });

    if (!result.success) {
      console.error("Resend specific error:", result.error);
      return NextResponse.json({ error: `Email service failure: ${result.error?.message || "Check API Key and Domain verification"}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Request received! 🐾" });
  } catch (error) {
    console.error("Enrollment API Catch-all Error:", error);
    return NextResponse.json({ error: `Internal error: ${error.message}` }, { status: 500 });
  }
}
