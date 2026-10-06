import { Request, Response } from 'express';
import httpStatus from 'http-status';

import * as appVersionService from './appVersion.service';
import { AppPlatform } from './appVersion.interface';
import catchAsync from '../../utils/catchAsync';


export const required = catchAsync(async (req: Request, res: Response) => {
  const platform = (req.header('x-client-platform') || req.header('x-platform')) as AppPlatform | null;
  if (!platform) {
    res.status(httpStatus.OK).json({ shouldUpdate: false, message: '' });
    return;
  }
  const current = req.header('x-app-version') || req.header('x-version') || (req.query['current'] as string | undefined) || '';

  const policy = await appVersionService.getPolicy(platform);
  if (!policy || !policy.enabled) {
    res.status(httpStatus.OK).json({
      shouldUpdate: false,
      message: '',
    });
    return;
  }

  const result = await appVersionService.evaluateVersion({
    platform,
    currentVersionRaw: current,
    treatMissingAsBlocked: false,
  });
  res.status(httpStatus.OK).json({
    shouldUpdate: result.shouldSoftBlock,
    message: result.shouldSoftBlock ? policy.softMessage || '' : '',
  });
});
