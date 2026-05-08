import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';

// --- Transporter ---

let transporter: Transporter;

const getTransporter = async (): Promise<Transporter> => {
  if (transporter) return transporter; // return existing if already initialized

  if (config.nodeEnv === 'development') {
    // const testAccount = await nodemailer.createTestAccount();
    // transporter = nodemailer.createTransport({
    //   host: 'smtp.ethereal.email',
    //   port: 587,
    //   auth: {
    //     user: testAccount.user,
    //     pass: testAccount.pass,
    //   },
    // });
    // commenting this
    // transporter = nodemailer.createTransport({
    //   host: 'smtp.ethereal.email',
    //   port: 587,
    //   auth: {
    //     user: config.email.user,
    //     pass: config.email.pass,
    //   },
    // });
    // console.log('Ethereal credentials →', {
    //   user: testAccount.user,
    //   pass: testAccount.pass, // add this
    // });
    //
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  transporter.verify((error) => {
    if (error) {
      console.error('Email transporter error:', error);
    } else {
      console.log('Email transporter ready');
    }
  });

  return transporter;
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
  const mail = await getTransporter();
  await mail.sendMail({
    from: `"Wordle App" <${config.email.gmail}>`,
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
  const mail = await getTransporter();
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;

  await mail.sendMail({
    from: `"Wordle App" <${config.email.gmail}>`,
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
