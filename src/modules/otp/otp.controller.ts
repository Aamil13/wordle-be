import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { otpService } from '.';
import httpStatus from 'http-status';

export const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await otpService.sendOtp(req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message,
    data: result.next, // { email, userName, displayName } → pass to OTP screen
  });
});

export const verifyOtpAndRegister = catchAsync(async (req: Request, res: Response) => {
  const { otp, email, ...registerInput } = req.body;
  const result = await otpService.verifyOtpAndRegister({ otp, email }, { email, ...registerInput });
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'successfully registered',
    data: {
      token: result.token,
      user: result.user, // full user object → navigate to home
    },
  });
});

export const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, userName } = req.body;
  const result = await otpService.resendOtp(email, userName);
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message,
  });
});
