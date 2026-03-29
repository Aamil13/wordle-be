import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import * as authService from './auth.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Account created successfully',
    data: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Logged in successfully',
    data: result,
  });
});

export const clerkAuth = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.clerkAuth(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Clerk authentication successful',
    data: result,
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message,
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Password reset successfully',
    data: result,
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { user },
  });
});
