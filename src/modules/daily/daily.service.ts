import { DailyWordModel } from './daily.model';
import { WordlesModel } from '../wordles/wordles.model';
import { UserModel } from '../auth/auth.model';
import { AppError } from '../../middlewares/error.middleware';

/**
 * Returns today's date as a 'YYYY-MM-DD' string (UTC).
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Fetches today's daily word.
 * If none exists yet, picks a random active word and creates the record.
 */
export const getDailyWord = async () => {
  const today = getTodayDateString();

  // Try to find an existing record for today
  let dailyWord = await DailyWordModel.findOne({ date: today });

  if (!dailyWord) {
    // Pick a random active word from the Wordles collection
    const [randomWord] = await WordlesModel.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } },
    ]);

    if (!randomWord) {
      throw new Error('No active words available to assign as the daily word');
    }

    dailyWord = await DailyWordModel.create({
      wordId: randomWord._id,
      word: randomWord.word,
      hint: randomWord.hint,
      difficulty: randomWord.difficulty,
      category: randomWord.category,
      date: today,
    });
  }

  return dailyWord;
};

/**
 * Marks the daily word as played for a user.
 * Sets dailyPlayedToday = true on the User document.
 */
export const markDailyPlayed = async (userId: string) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { dailyPlayedToday: true },
    { new: true },
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Returns whether the user has already played today's daily mode.
 */
export const hasDailyPlayedToday = async (userId: string): Promise<boolean> => {
  const user = await UserModel.findById(userId).select('dailyPlayedToday');

  if (!user) {
    throw new Error('User not found');
  }

  return user.dailyPlayedToday;
};

/**
 * Resets dailyPlayedToday to false for ALL users.
 * Called automatically at 00:05 each day.
 */
export const resetAllDailyPlayed = async () => {
  await UserModel.updateMany({}, { dailyPlayedToday: false });
};

/**
 * Creates a daily word for a specific date using a provided word ID.
 * Fetches the word details from the Wordles collection and creates the DailyWord record.
 */
export const createDailyWord = async (wordId: string, date: string) => {
  const existingDailyWord = await DailyWordModel.findOne({ date });

  if (existingDailyWord) {
    throw new AppError('Daily word already exists for this date', 409);
  }

  const word = await WordlesModel.findById(wordId);

  if (!word) {
    throw new AppError('Word not found', 404);
  }

  const dailyWord = await DailyWordModel.create({
    wordId: word._id,
    word: word.word,
    hint: word.hint,
    difficulty: word.difficulty,
    category: word.category,
    date,
  });

  return dailyWord;
};
