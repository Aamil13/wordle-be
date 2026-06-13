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
