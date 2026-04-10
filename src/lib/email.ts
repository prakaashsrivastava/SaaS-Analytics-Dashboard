import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: "Welcome to SaaS Analytics Dashboard",
      html: `<p>Hi ${name},</p><p>Welcome to your new dashboard! We're excited to have you on board.</p>`,
    });

    return info;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return null;
  }
}

export async function sendInvitationEmail(
  email: string,
  orgName: string,
  role: string,
  token: string
) {
  const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: `Invite to join ${orgName} on SaaS Analytics Dashboard`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #E2E8F0; border-radius: 24px; color: #0F172A;">
          <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">You've been invited!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">You have been invited to join <strong style="color: #0F172A;">${orgName}</strong> as a <strong style="color: #4F46E5;">${role}</strong>.</p>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">Click the button below to accept the invitation and set up your account:</p>
          <div style="margin: 32px 0;">
            <a href="${inviteLink}" style="background-color: #4F46E5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 14px; color: #94A3B8;">Or copy and paste this link in your browser:</p>
          <p style="font-size: 14px; color: #4F46E5; word-break: break-all;">${inviteLink}</p>
          <hr style="margin: 32px 0; border: 0; border-top: 1px solid #E2E8F0;" />
          <p style="color: #94A3B8; font-size: 12px; font-weight: 500;">This invitation will expire in 48 hours.</p>
        </div>
      `,
    });

    return info;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return null;
  }
}
