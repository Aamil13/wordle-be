import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from './auth.model';
import {
  IRegisterInput,
  ILoginInput,
  IClerkInput,
  IForgotPasswordInput,
  IResetPasswordInput,
  IUserResponse,
  AuthProvider,
} from './auth.interface';
import { config } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';
import httpStatus from 'http-status';
import { sendPasswordResetEmail } from '../../utils/email';

// --- Helpers ---

const signToken = (id: string, email: string): string =>
  jwt.sign({ id, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

const formatUser = (user: any): IUserResponse => ({
  id: user._id.toString(),
  userName: user.userName,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
  provider: user.provider,
  stats: user.stats,
  lastLoginAt: user.lastLoginAt,
});

// --- Services ---

export const register = async (input: IRegisterInput) => {
  const existingEmail = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existingEmail) throw new AppError('Email already in use', httpStatus.CONFLICT);

  const existingUserName = await UserModel.findOne({ userName: input.userName.toLowerCase() });
  if (existingUserName) throw new AppError('Username already taken', httpStatus.CONFLICT);

  const user = await UserModel.create({ ...input, provider: AuthProvider.LOCAL });
  const token = signToken(user._id.toString(), user.email);

  return { token, user: formatUser(user) };
};

export const login = async (input: ILoginInput) => {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() }).select('+password');

  if (!user || !user.password) {
    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }
  if (user.provider === AuthProvider.CLERK) {
    throw new AppError('This account uses Clerk login', httpStatus.BAD_REQUEST);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);

  if (!user.isActive) throw new AppError('Account has been deactivated', httpStatus.FORBIDDEN);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id.toString(), user.email);
  return { token, user: formatUser(user) };
};

export const clerkAuth = async (input: IClerkInput) => {
  let user = await UserModel.findOne({ clerkId: input.clerkId });

  if (user) {
    user.lastLoginAt = new Date();
    user.avatar = input.avatar ?? user.avatar;
    await user.save({ validateBeforeSave: false });
  } else {
    const emailTaken = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (emailTaken) {
      throw new AppError(
        'An account with this email already exists. Please log in with your password.',
        httpStatus.CONFLICT,
      );
    }

    const userNameTaken = await UserModel.findOne({ userName: input.userName.toLowerCase() });
    if (userNameTaken) input.userName = `${input.userName}${Math.floor(Math.random() * 1000)}`;

    user = await UserModel.create({ ...input, provider: AuthProvider.CLERK });
  }

  const token = signToken(user._id.toString(), user.email);
  return { token, user: formatUser(user) };
};

export const forgotPassword = async (input: IForgotPasswordInput) => {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });

  // Always return success even if email not found — prevents email enumeration attacks
  if (!user || user.provider === AuthProvider.CLERK) {
    return { message: 'If that email exists, a reset link has been sent' };
  }

  // Generate a random token and hash it before storing
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  // Send raw token to user's email — we only store the hash
  await sendPasswordResetEmail(user.email, user.userName, rawToken);

  return { message: 'If that email exists, a reset link has been sent' };
};

export const resetPassword = async (input: IResetPasswordInput) => {
  // Hash the incoming token and compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(input.token).digest('hex');

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() }, // not expired
  }).select('+password');

  if (!user) throw new AppError('Invalid or expired reset token', httpStatus.BAD_REQUEST);

  user.password = input.newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  const token = signToken(user._id.toString(), user.email);
  return { token, user: formatUser(user) };
};

export const getProfile = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError('User not found', httpStatus.NOT_FOUND);
  return formatUser(user);
};
