import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to SaaS Analytics Dashboard',
      html: `<p>Hi ${name},</p><p>Welcome to your new dashboard! We're excited to have you on board.</p>`,
    });

    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return null;
  }
}
