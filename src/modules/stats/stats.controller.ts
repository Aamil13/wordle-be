import { Response } from 'express';
import httpStatus from 'http-status';
import { GameMode } from '../auth/auth.interface';
import { AuthRequest } from '../../middlewares/auth.middleware';
import catchAsync from '../../utils/catchAsync';
import { statsService } from '.';

export const updateStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { gameMode, result } = req.body;
  const updatedStats = await statsService.updateStats({
    userId,
    gameMode,
    result,
  });

  res.status(httpStatus.OK).json({
    success: true,
    data: updatedStats,
  });
});

export const updateInfiniteSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { correctGuesses } = req.body;

  const result = await statsService.updateInfiniteSession(userId, correctGuesses);

  res.status(httpStatus.OK).json({
    success: true,
    data: result,
  });
});

export const getStatsByMode = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { gameMode } = req.params;
  console.time('gameMode');
  const stats = await statsService.getStatsByMode(userId, gameMode as GameMode);
  console.timeEnd('gameMode');
  res.status(httpStatus.OK).json({
    success: true,
    gameMode,
    stats,
  });
});

export const getAllStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const stats = await statsService.getAllStats(userId);

  res.status(httpStatus.OK).json({
    success: true,
    stats,
  });
});

export const getUserStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  console.time('getAllStats');
  const stats = await statsService.getAllStats(userId as string);
  console.timeEnd('getAllStats');
  res.status(httpStatus.OK).json({
    success: true,
    userId,
    stats,
  });
});

export const resetStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { gameMode } = req.params;

  const result = await statsService.resetStats(userId, gameMode as GameMode);

  res.status(httpStatus.OK).json({
    success: true,
    data: result,
  });
});

export const batchUpdateStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { games } = req.body;

  const results = [];

  for (const game of games) {
    try {
      const result = await statsService.updateStats({
        userId,
        gameMode: game.gameMode,
        result: game.result,
      });

      results.push({
        success: true,
        gameMode: game.gameMode,
        stats: result.stats,
      });
    } catch (error) {
      results.push({
        success: false,
        gameMode: game.gameMode,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  res.status(httpStatus.OK).json({
    success: true,
    results,
  });
});
