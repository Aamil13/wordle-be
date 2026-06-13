import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { wordlesService } from '.';

export const createWord = catchAsync(async (req: Request, res: Response) => {
  const result = await wordlesService.createWord(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Word created successfully',
    data: result,
  });
});

export const getAllWords = catchAsync(async (req: Request, res: Response) => {
  const result = await wordlesService.getAllWords();
  console.log('result11', result);
  res.status(httpStatus.OK).json({
    success: true,
    results: result.length,
    data: result,
  });
});

export const getWordById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await wordlesService.getWordById(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    data: result,
  });
});

export const getWordsByDifficulty = catchAsync(async (req: Request, res: Response) => {
  const { difficulty } = req.params;

  const result = await wordlesService.getWordsByDifficulty(difficulty as string);

  res.status(httpStatus.OK).json({
    success: true,
    results: result.length,
    data: result,
  });
});

export const getWordsByCategory = catchAsync(async (req: Request, res: Response) => {
  const { category } = req.params;

  const result = await wordlesService.getWordsByCategory(category as string);

  res.status(httpStatus.OK).json({
    success: true,
    results: result.length,
    data: result,
  });
});

export const updateWord = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await wordlesService.updateWord(id as string, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Word updated successfully',
    data: result,
  });
});

export const deleteWord = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await wordlesService.deleteWord(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Word deleted successfully',
    data: result,
  });
});

export const toggleWordStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await wordlesService.toggleWordStatus(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Word status updated successfully',
    data: result,
  });
});

export const incrementPlayed = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await wordlesService.incrementPlayed(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Times played incremented',
    data: result,
  });
});

export const getRandomWord = catchAsync(async (req: Request, res: Response) => {
  const result = await wordlesService.getRandomWord();

  res.status(httpStatus.OK).json({
    success: true,
    data: result,
  });
});
