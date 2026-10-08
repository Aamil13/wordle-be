import { config } from '../config/env';

// --- Brevo HTTP API sender ---

interface BrevoEmailPayload {
  to: string;
  subject: string;
  html: string;
}

const sendViaBrevo = async ({ to, subject, html }: BrevoEmailPayload): Promise<void> => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': config.email.brevoApiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: config.email.fromName, email: config.email.fromAddress },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${errorBody}`);
  }
};

// --- Base template ---

const baseTemplate = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #6aaa64; letter-spacing: 4px;">WORDLE</h2>
    <hr style="border: 1px solid #d3d6da;" />
    ${content}
    <hr style="border: 1px solid #d3d6da;" />
    <p style="color: #787c7e; font-size: 12px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
`;

// --- Email senders ---

export const sendOtpEmail = async (to: string, userName: string, otp: string): Promise<void> => {
  await sendViaBrevo({
    to,
    subject: 'Your verification code',
    html: baseTemplate(`
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your verification code is:</p>
      <div style="
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 12px;
        text-align: center;
        padding: 24px;
        background: #f9f9f9;
        border-radius: 8px;
        margin: 24px 0;
      ">
        ${otp}
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
    `),
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  token: string,
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;

  await sendViaBrevo({
    to,
    subject: 'Reset your password',
    html: baseTemplate(`
      <p>Hi <strong>${userName}</strong>,</p>
      <p>You requested a password reset. Click the button below:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="
          background: #6aaa64;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          font-size: 16px;
        ">
          Reset Password
        </a>
      </div>
      <p style="color: #787c7e; font-size: 13px;">
        Or copy this link: <a href="${resetUrl}">${resetUrl}</a>
      </p>
      <p>This link expires in <strong>15 minutes</strong>.</p>
    `),
  });
};
