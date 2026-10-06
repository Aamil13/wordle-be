import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { appVersionService } from '../modules/appVersion';
import { AppPlatform } from '../modules/appVersion/appVersion.interface';
import catchAsync from '../utils/catchAsync';
import { AppError } from './error.middleware';
import { log } from 'console';


function detectMobileApp(req: Request): { isMobileApp: boolean; platform: AppPlatform | null } {
  const platformHeaderRaw = (req.header('x-client-platform') || req.header('x-platform') || '').toLowerCase();
  const platform = platformHeaderRaw === 'android' || platformHeaderRaw === 'ios' ? (platformHeaderRaw as AppPlatform) : null;
  // Only treat as "mobile app" when explicitly marked OR when UA is clearly non-browser mobile app.
  const clientType = (req.header('x-client-type') || req.header('x-client') || '').toLowerCase();
  const ua = (req.header('user-agent') || '').toLowerCase();

  const explicitApp =
    clientType === 'app' ||
    clientType === 'mobile' ||
    clientType === 'react-native' ||
    clientType === 'rn' ||
    Boolean(platform);

  // RN / native-http libraries (avoid blocking mobile browsers)
  const uaLooksLikeNativeApp =
    ua.includes('reactnative') ||
    ua.includes('okhttp') ||
    ua.includes('cfnetwork');

  const isMobileApp = explicitApp || uaLooksLikeNativeApp;
  return { isMobileApp, platform };
}

export const appVersionMiddleware = catchAsync(async (req: Request, _: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path.startsWith('/docs')) return next();

  const authHeader = req.header('authorization') || '';
  const hasJwt = /^bearer\s+.+/i.test(authHeader);
  const upgradeRequiredStatus = (httpStatus as any).UPGRADE_REQUIRED ?? 426;
  const jwtExpiredMessage = 'jwt expired';

  const { isMobileApp, platform } = detectMobileApp(req);

  if (!isMobileApp) return next();

  // This forces very old apps (that don't send platform headers) to update.
  if (!platform) {
    if (hasJwt) {
      throw new AppError(jwtExpiredMessage, httpStatus.UNAUTHORIZED);
    }
    throw new AppError('Please update your app to continue.', upgradeRequiredStatus);
  }

  const current = req.header('x-app-version') || req.header('x-version') || '';
  const result = await appVersionService.checkAllowedOrThrow({
    platform,
    currentVersionRaw: current,
    // If we detect "mobile app" traffic, allow DB to force-block requests even if old apps don't send version.
    treatMissingAsBlocked: true,
    hasJwt,
  });
  // Soft block = allow request, but client can show alert (newer apps).
  // Only for mobile-app requests, so web is unaffected.
  if (result.shouldSoftBlock) {
    //  nothing will happen as soft block will be handled in the app itself through the api call
  }
  return next();
});
