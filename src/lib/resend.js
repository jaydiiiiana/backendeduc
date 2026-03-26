import { Resend } from 'resend';

export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY || 're_placeholder';
  const resend = new Resend(apiKey);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Cat Academy <onboarding@resend.dev>', // Use verified domain here later
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email caught error:', err);
    return { success: false, error: err.message };
  }
};
