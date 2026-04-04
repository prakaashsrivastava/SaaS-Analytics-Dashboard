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
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited!</h2>
          <p>You have been invited to join <strong>${orgName}</strong> as a <strong>${role}</strong>.</p>
          <p>Click the button below to accept the invitation and set up your account:</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${inviteLink}</p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">This invitation will expire in 48 hours.</p>
        </div>
      `,
    });

    return info;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return null;
  }
}
