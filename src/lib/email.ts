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
