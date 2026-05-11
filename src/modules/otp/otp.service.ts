import { AppError } from '../../middlewares/error.middleware';
import { IRegisterInput } from '../auth/auth.interface';
import { UserModel } from '../auth/auth.model';
import OtpModel from './otp.model';
import { sendOtpEmail } from '../../utils/email';
import httpStatus from 'http-status';
import crypto from 'crypto';
import { authService } from '../auth';

// otp helper
const generateOtp = (): { raw: string; hashed: string } => {
  const raw = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
};

// Validates input, sends OTP, moves user to OTP screen

export const sendOtp = async (input: IRegisterInput) => {
  // Check for existing accounts before sending OTP
  const existingEmail = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existingEmail) throw new AppError('Email already in use', httpStatus.CONFLICT);

  const existingUserName = await UserModel.findOne({ userName: input.userName.toLowerCase() });
  if (existingUserName) throw new AppError('Username already taken', httpStatus.CONFLICT);

  const { raw, hashed } = generateOtp();

  // Upsert — replaces existing OTP if user is resending
  await OtpModel.findOneAndUpdate(
    { email: input.email.toLowerCase() },
    {
      email: input.email.toLowerCase(),
      otp: hashed,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    { upsert: true, new: true },
  );

  await sendOtpEmail(input.email, input.userName, raw);

  // Return registration data so the app can pass it forward to the OTP screen
  return {
    message: 'OTP sent to your email',
    next: {
      email: input.email.toLowerCase(),
      userName: input.userName,
      displayName: input.displayName,
      // password is NOT returned — store temporarily in app state or secure storage
    },
  };
};

export const verifyOtpAndRegister = async (
  otpInput: { email: string; otp: string },
  registerInput: IRegisterInput, // full registration data passed from app state
) => {
  const otpRecord = await OtpModel.findOne({
    email: otpInput.email.toLowerCase(),
  }).select('+otp');

  if (!otpRecord) {
    throw new AppError('OTP not found or expired. Please register again.', httpStatus.BAD_REQUEST);
  }

  if (otpRecord.expiresAt < new Date()) {
    await OtpModel.deleteOne({ email: otpInput.email.toLowerCase() });
    throw new AppError('OTP has expired. Please register again.', httpStatus.BAD_REQUEST);
  }

  const hashedInput = crypto.createHash('sha256').update(otpInput.otp).digest('hex');
  if (hashedInput !== otpRecord.otp) {
    throw new AppError('Invalid OTP', httpStatus.UNAUTHORIZED);
  }

  // OTP valid — delete it and create the user
  await OtpModel.deleteOne({ email: otpInput.email.toLowerCase() });

  return await authService.register(registerInput);
};

export const resendOtp = async (email: string, userName: string) => {
  // Make sure they aren't already registered
  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new AppError('Email already registered', httpStatus.CONFLICT);

  const { raw, hashed } = generateOtp();

  await OtpModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      otp: hashed,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    { upsert: true, new: true },
  );

  await sendOtpEmail(email, userName, raw);

  return { message: 'OTP resent successfully' };
};
