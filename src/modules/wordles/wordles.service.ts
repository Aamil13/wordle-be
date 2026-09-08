import { IWordles } from './wordles.interface';
import { WordlesModel } from './wordles.model';

export const createWord = async (payload: Partial<IWordles>) => {
  const result = await WordlesModel.create(payload);
  return result;
};

export const getAllWords = async () => {
  const result = await WordlesModel.find({ isActive: true }).limit(20).sort({ createdAt: -1 });

  return result;
};

export const getWordById = async (id: string) => {
  const result = await WordlesModel.findById(id);
  return result;
};

export const getWordsByDifficulty = async (difficulty: string) => {
  const result = await WordlesModel.find({
    difficulty,
    isActive: true,
  }).limit(20);

  return result;
};

export const getWordsByCategory = async (category: string) => {
  const result = await WordlesModel.find({
    category,
    isActive: true,
  }).limit(20);

  return result;
};

export const updateWord = async (id: string, payload: Partial<IWordles>) => {
  const result = await WordlesModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const deleteWord = async (id: string) => {
  const result = await WordlesModel.findByIdAndDelete(id);
  return result;
};

export const toggleWordStatus = async (id: string) => {
  const word = await WordlesModel.findById(id);

  if (!word) {
    throw new Error('Word not found');
  }

  word.isActive = !word.isActive;

  await word.save();

  return word;
};

export const incrementPlayed = async (id: string) => {
  const result = await WordlesModel.findByIdAndUpdate(
    id,
    {
      $inc: {
        timesPlayed: 1,
      },
    },
    {
      new: true,
    },
  );

  return result;
};

export const getRandomWord = async () => {
  const result = await WordlesModel.aggregate([
    {
      $match: {
        isActive: true,
      },
    },
    {
      $sample: {
        size: 1,
      },
    },
  ]);

  return result[0];
};

export const updateStats = async (id: string, payload: { won: boolean }) => {
  const word = await WordlesModel.findById(id);

  if (!word) {
    throw new Error('Word not found');
  }

  // Get attempts from the word document
  const attempts = word.attempts;

  // Increment timesPlayed
  word.timesPlayed += 1;

  // Calculate current wins from successRate
  const currentWins = (word.successRate * word.timesPlayed) / 100;

  // Calculate current total attempts from averageAttempts
  const currentTotalAttempts = word.averageAttempts * word.timesPlayed;

  if (payload.won) {
    // Increment wins
    const newWins = currentWins + 1;
    // Calculate new successRate
    word.successRate = (newWins / word.timesPlayed) * 100;
  } else {
    // Recalculate successRate with same wins but increased plays
    word.successRate = (currentWins / word.timesPlayed) * 100;
  }

  // Calculate new averageAttempts
  const newTotalAttempts = currentTotalAttempts + attempts;
  word.averageAttempts = newTotalAttempts / word.timesPlayed;

  // Reset attempts for next game
  word.attempts = 0;

  await word.save();

  return word;
};
