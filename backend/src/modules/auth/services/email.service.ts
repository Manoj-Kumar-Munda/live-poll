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
  async sendVerificationEmail({
    user,
    url,
  }: {
    user: AuthEmailUser;
    url: string;
  }) {
    await sendAuthEmail({
      to: user.email,
      subject: "Verify your LivePoll email",
      html: `
        <p>Hi ${user.name},</p>
        <p>Verify your email to start using LivePoll.</p>
        <p><a href="${url}">Verify email</a></p>
        <p>If you did not create an account, you can ignore this email.</p>
      `,
    });
  },

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
