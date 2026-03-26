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
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fafaf9; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background-color: #1e40af; padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; }
          .content { padding: 40px; background-color: white; }
          .info-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 30px; }
          .info-item { border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
          .label { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
          .value { font-size: 16px; font-weight: 600; color: #1e293b; }
          .badge { display: inline-block; background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-top: 5px; }
          .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          .notes-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <p style="font-size: 10px; font-weight: 800; opacity: 0.8; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 3px;">Institutional Onboarding</p>
            <h1>Enrollment Request</h1>
          </div>
          
          <div class="content">
            <p style="color: #64748b; margin-bottom: 30px; font-weight: 500;">A new institution has requested an academic onboarding session. Below are the registered details:</p>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Institution Name</div>
                <div class="value">${schoolName}</div>
              </div>
              <div class="info-item">
                <div class="label">Contact Representative</div>
                <div class="value">${contactPerson}</div>
              </div>
              <div class="info-item" style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                   <div class="label">Official Email</div>
                   <div class="value">${contactEmail}</div>
                </div>
                <div style="flex: 1;">
                   <div class="label">Phone Number</div>
                   <div class="value">${contactPhone}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="label">Selected Tier</div>
                <div class="badge">${planName || "Trial"}</div>
              </div>
              <div class="info-item" style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                   <div class="label">Meeting Date</div>
                   <div class="value">${preferredDate}</div>
                </div>
                <div style="flex: 1;">
                   <div class="label">Preferred Time</div>
                   <div class="value">${preferredTime}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="label">Meeting Environment</div>
                <div class="value">${meetingType === 'Zoom' ? '💻 Online Conference (Zoom)' : '🤝 Personal Consultation'}</div>
              </div>
            </div>

            <div class="notes-box">
              <div class="label" style="color: #b45309;">Preparation & Requirements</div>
              <div class="value" style="font-style: italic; color: #92400e; font-weight: 500;">"${notes || "None provided."}"</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Cat Academy Project</strong> • Advanced Learning Management</p>
            <p style="margin-top: 5px;">This is an automated institutional notification.</p>
          </div>
        </div>
      </body>
      </html>
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
