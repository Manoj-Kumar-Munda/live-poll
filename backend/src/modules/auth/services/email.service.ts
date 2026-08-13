import { Resend } from "resend";
import { env } from "@/config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

type AuthEmailUser = {
  email: string;
  name: string;
};

async function sendAuthEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });
}

export const emailService = {
  async sendResetPassword({
    user,
    url,
  }: {
    user: AuthEmailUser;
    url: string;
  }) {
    await sendAuthEmail({
      to: user.email,
      subject: "Reset your LivePoll password",
      html: `
        <p>Hi ${user.name},</p>
        <p>Reset your password using the link below.</p>
        <p><a href="${url}">Reset password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  },
};
