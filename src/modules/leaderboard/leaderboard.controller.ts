import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import * as leaderboardService from './leaderboard.service';
import { LeaderboardMode } from './leaderboard.interface';

/**
 * GET /api/v1/leaderboard?mode=daily&limit=50
 * GET /api/v1/leaderboard?mode=daily&limit=50&date=2025-07-09
 *
 * - No date → live today from Redis
 * - date provided → historical snapshot from MongoDB
 */
export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { mode, limit, date } = req.query as {
    mode: LeaderboardMode;
    limit?: string;
    date?: string;
  };

  const parsedLimit = limit ? parseInt(limit, 10) : 50;

  const isHistorical = !!date;

  const data = isHistorical
    ? await leaderboardService.getHistoricalLeaderboard(mode, date!, parsedLimit)
    : await leaderboardService.getLiveLeaderboard(mode, parsedLimit);

  res.status(httpStatus.OK).json({
    success: true,
    mode,
    date: date ?? new Date().toISOString().slice(0, 10),
    live: !isHistorical,
    total: data.length,
    leaderboard: data,
  });
});
