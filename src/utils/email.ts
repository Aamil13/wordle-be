import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  token: string,
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Wordle App" <${config.email.user}>`,
    to,
    subject: 'Reset your password',
    html: `
      <h2>Hi ${userName},</h2>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in <strong>15 minutes</strong>.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};
