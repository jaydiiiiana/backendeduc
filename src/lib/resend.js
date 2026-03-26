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
      console.error('RESEND SERVICE ERROR Details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('RESEND EXCEPTION Caught:', err);
    return { success: false, error: { message: err.message, name: err.name } };
  }
};
