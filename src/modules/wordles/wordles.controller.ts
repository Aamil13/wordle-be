import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import * as wordlesService from './wordles.service';
import httpStatus from 'http-status';

export const getAllWordless = catchAsync(async (_req: Request, res: Response) => {
  const data = await wordlesService.getAll();
  res.status(httpStatus.OK).json({ status: 'success', data });
});

export const getWordlesById = catchAsync(async (req: Request, res: Response) => {
  const data = await wordlesService.getById(req.params.id as string);
  res.status(httpStatus.OK).json({ status: 'success', data });
});

export const createWordles = catchAsync(async (req: Request, res: Response) => {
  const data = await wordlesService.create(req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', data });
});

export const updateWordles = catchAsync(async (req: Request, res: Response) => {
  const data = await wordlesService.update(req.params.id as string, req.body);
  res.status(httpStatus.OK).json({ status: 'success', data });
});

export const deleteWordles = catchAsync(async (req: Request, res: Response) => {
  await wordlesService.remove(req.params.id as string);
  res.status(httpStatus.NO_CONTENT).send();
});
