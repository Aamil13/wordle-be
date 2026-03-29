import { IWordlesInput } from './wordles.interface';
import { WordlesModel } from './wordles.model';

export const getAll = async () => {
  return WordlesModel.find();
};

export const getById = async (id: string) => {
  return WordlesModel.findById(id);
};

export const create = async (input: IWordlesInput) => {
  return WordlesModel.create(input);
};

export const update = async (id: string, input: Partial<IWordlesInput>) => {
  return WordlesModel.findByIdAndUpdate(id, input, { new: true });
};

export const remove = async (id: string) => {
  return WordlesModel.findByIdAndDelete(id);
};
