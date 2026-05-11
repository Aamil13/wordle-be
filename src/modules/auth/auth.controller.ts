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
  const result: any = await authService.forgotPassword(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message,
    data: result.data,
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Password reset successfully',
    // data: result,
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { user },
  });
});

export const isUserNameTaken = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await authService.getIsUserNameTaken(req.body.userName);

  res.status(httpStatus.OK).json({
    status: 'success',
    data: { isUserNameTaken: !!user, message: user ? 'User name already taken' : '' },
  });
});

export const isEmailTaken = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await authService.getIsEmailTaken(req.body.email);

  res.status(httpStatus.OK).json({
    status: 'success',
    data: { isEmailTaken: !!user, message: user ? 'User email already taken' : '' },
  });
});
