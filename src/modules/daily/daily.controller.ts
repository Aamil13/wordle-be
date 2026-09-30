import { Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { dailyService } from '.';
import { config } from '../../config/env';

/**
 * GET /daily
 * Returns today's daily word.
 * - Authenticated: also returns whether the user has already played today.
 * - Unauthenticated: returns the word without played status.
 */
export const getDailyWord = catchAsync(async (req: AuthRequest, res: Response) => {
  const dailyWord = await dailyService.getDailyWord();

  // If user is authenticated, include their played status
  let alreadyPlayed: boolean | undefined;
  if (req.user?.id) {
    alreadyPlayed = await dailyService.hasDailyPlayedToday(req.user.id);
  }

  res.status(httpStatus.OK).json({
    success: true,
    data: dailyWord,
    ...(req.user?.id !== undefined && { alreadyPlayed }),
  });
});

/**
 * POST /daily/played
 * Marks today's daily word as played for the authenticated user.
 * Returns 409 if already played today.
 */
export const markDailyPlayed = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const alreadyPlayed = await dailyService.hasDailyPlayedToday(userId);

  if (alreadyPlayed) {
    res.status(httpStatus.CONFLICT).json({
      success: false,
      message: 'You have already played daily mode today. Come back tomorrow!',
    });
    return;
  }

  await dailyService.markDailyPlayed(userId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Daily word marked as played',
  });
});

/**
 * POST /daily/create
 * Creates a daily word for a specific date using a provided word ID.
 * Request body: { wordId: string, date: string }
 */
export const createDailyWord = catchAsync(async (req: AuthRequest, res: Response) => {
  const { wordId, date } = req.body;


  if (!wordId || !date) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'wordId and date are required',
    });
    return;
  }

  const dailyWord = await dailyService.createDailyWord(wordId, date);

  res.status(httpStatus.CREATED).json({
    success: true,
    data: dailyWord,
  });
});

/**
 * POST /daily/reset
 * Manually resets dailyPlayedToday to false for ALL users.
 * Requires DAILY_RESET_KEY in request body for security.
 */
export const resetDailyPlayed = catchAsync(async (req: AuthRequest, res: Response) => {
  const { key } = req.body;
console.log({
  receivedKey: !!req.body?.key,
  configuredKey: !!process.env.DAILY_RESET_KEY,
  matches: req.body?.key === process.env.DAILY_RESET_KEY,
});
  if (!key || key !== config.dailyResetKey) {
    res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or missing reset key',
    });
    return;
  }

  await dailyService.resetAllDailyPlayed();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Daily reset complete — dailyPlayedToday set to false for all users',
  });
});
