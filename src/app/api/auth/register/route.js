import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password, grade, verificationCode, school, nickname } = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. Mandatory Input Validation
    if (!name || !email || !password || !verificationCode) {
      return NextResponse.json({ error: "Missing required fields! 😿" }, { status: 400 });
    }

    if (!email.endsWith("@educ.ph")) {
      return NextResponse.json({ error: "Access Denied: Only @educ.ph emails are allowed. 🏫" }, { status: 403 });
    }

    // Password complexity check
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    if (password.length < 8 || !hasUpper || !hasLower) {
      return NextResponse.json({ error: "Password must be at least 8 characters and include BOTH uppercase and lowercase letters. 🛡️" }, { status: 400 });
    }

    // Check if user or email exists
    const checkUser = await fetch(`${supabaseUrl}/rest/v1/users?or=(name.ilike.${name},email.eq.${email})&select=*`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const users = await checkUser.json();

    if (users && users.length > 0) {
      const conflict = users[0].name.toLowerCase() === name.toLowerCase() ? "username" : "email";
      return NextResponse.json({ error: `That ${conflict} is already taken! 😿` }, { status: 400 });
    }

    // 2. Verify Code and Determine Role
    let role = "Student";
    let creatorId = null;
    let expirationDate = null;

    if (verificationCode) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const codeRes = await fetch(`${supabaseUrl}/rest/v1/registration_codes?code=eq.${verificationCode}&is_used=eq.false&created_at=gte.${oneDayAgo.toISOString()}&select=*`, {
        headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
      });
      const inviteData = await codeRes.json();
      const invite = inviteData[0];
      
      if (!invite) {
        return NextResponse.json({ error: "Invalid or expired verification code! 😿" }, { status: 400 });
      }
      
      role = invite.role_to_grant;
      creatorId = invite.created_by;

      if (invite.duration_months && invite.duration_months > 0) {
        const now = new Date();
        now.setMonth(now.getMonth() + invite.duration_months);
        expirationDate = now.toISOString();
      }

      // Mark code as used
      await fetch(`${supabaseUrl}/rest/v1/registration_codes?id=eq.${invite.id}`, {
        method: "PATCH",
        headers: { 
          "apikey": supabaseKey, 
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_used: true })
      });

      // Automatically generate a replacement code
      const newCodeStr = "CODE-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      await fetch(`${supabaseUrl}/rest/v1/registration_codes`, {
        method: "POST",
        headers: { 
          "apikey": supabaseKey, 
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          code: newCodeStr, 
          role_to_grant: invite.role_to_grant, 
          created_by: invite.created_by, 
          is_used: false 
        })
      });
    }

    // Insert new user
    const newUser = {
      name,
      email,
      password,
      nickname: nickname || name,
      school: school || "N/A",
      grade,
      role: role,
      is_verified: false,
      invited_by: creatorId,
      subscription_expires_at: expirationDate,
      exp: 0,
      level: 1,
      created_at: new Date().toISOString()
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers: { 
        "apikey": supabaseKey, 
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(newUser)
    });
    
    const insertData = await insertResponse.json();
    
    if (!insertResponse.ok) {
      console.error("Supabase Insert Error:", insertData);
      return NextResponse.json({ 
        error: "Database error during registration! 😿", 
        details: insertData.message || "Unknown schema error" 
      }, { status: insertResponse.status });
    }

    const insertedUser = Array.isArray(insertData) ? insertData[0] : insertData;

    return NextResponse.json({ success: true, user: insertedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register! 😿 (Check Supabase Config)" }, { status: 500 });
  }
}
