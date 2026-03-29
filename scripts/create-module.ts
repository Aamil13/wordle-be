import * as fs from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error(
    '❌  Please provide a module name: npx ts-node scripts/create-module.ts <module-name>',
  );
  process.exit(1);
}

const name = moduleName.toLowerCase();
const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
const modulePath = path.join(__dirname, '..', 'src', 'modules', name);

if (fs.existsSync(modulePath)) {
  console.error(`❌  Module "${name}" already exists`);
  process.exit(1);
}

// --- File templates ---

const controller = `import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import * as ${name}Service from './${name}.service';
import httpStatus from 'http-status';

export const getAll${capitalName}s = catchAsync(async (_req: Request, res: Response) => {
  const data = await ${name}Service.getAll();
  res.status(httpStatus.OK).json({ status: 'success', data });
});

export const get${capitalName}ById = catchAsync(async (req: Request, res: Response) => {
  const data = await ${name}Service.getById(req.params.id);
  res.status(httpStatus.OK).json({ status: 'success', data });
});

export const create${capitalName} = catchAsync(async (req: Request, res: Response) => {
  const data = await ${name}Service.create(req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', data });
});

export const update${capitalName} = catchAsync(async (req: Request, res: Response) => {
  const data = await ${name}Service.update(req.params.id, req.body);
  res.status(httpStatus.OK).json({ status: 'success', data });
});

export const delete${capitalName} = catchAsync(async (req: Request, res: Response) => {
  await ${name}Service.remove(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
`;

const interfaceFile = `import { Document } from 'mongoose';

export interface I${capitalName} extends Document {
  // define your fields here
  createdAt: Date;
  updatedAt: Date;
}

export interface I${capitalName}Input {
  // define create/update input fields here
}
`;

const model = `import mongoose, { Schema } from 'mongoose';
import { I${capitalName} } from './${name}.interface';

const ${capitalName}Schema = new Schema<I${capitalName}>(
  {
    // define your schema fields here
  },
  {
    timestamps: true,
  }
);

export const ${capitalName}Model = mongoose.model<I${capitalName}>('${capitalName}', ${capitalName}Schema);
`;

const service = `import { I${capitalName}Input } from './${name}.interface';
import { ${capitalName}Model } from './${name}.model';

export const getAll = async () => {
  return ${capitalName}Model.find();
};

export const getById = async (id: string) => {
  return ${capitalName}Model.findById(id);
};

export const create = async (input: I${capitalName}Input) => {
  return ${capitalName}Model.create(input);
};

export const update = async (id: string, input: Partial<I${capitalName}Input>) => {
  return ${capitalName}Model.findByIdAndUpdate(id, input, { new: true });
};

export const remove = async (id: string) => {
  return ${capitalName}Model.findByIdAndDelete(id);
};
`;

const validate = `import Joi from 'joi';

export const create${capitalName}Schema = Joi.object({
  // define validation rules here
});

export const update${capitalName}Schema = Joi.object({
  // define validation rules here
}).min(1);
`;

const index = `import { Router } from 'express';
import * as ${name}Controller from './${name}.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { create${capitalName}Schema, update${capitalName}Schema } from './${name}.validate';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(${name}Controller.getAll${capitalName}s)
  .post(validate(create${capitalName}Schema), ${name}Controller.create${capitalName});

router
  .route('/:id')
  .get(${name}Controller.get${capitalName}ById)
  .patch(validate(update${capitalName}Schema), ${name}Controller.update${capitalName})
  .delete(${name}Controller.delete${capitalName});

export default router;
`;

// --- Create files ---

const files: Record<string, string> = {
  [`${name}.controller.ts`]: controller,
  [`${name}.interface.ts`]: interfaceFile,
  [`${name}.model.ts`]: model,
  [`${name}.service.ts`]: service,
  [`${name}.validate.ts`]: validate,
  ['index.ts']: index,
};

fs.mkdirSync(modulePath, { recursive: true });

Object.entries(files).forEach(([filename, content]) => {
  fs.writeFileSync(path.join(modulePath, filename), content);
  console.log(`  ✅ created ${filename}`);
});

console.log(`\n🚀 Module "${name}" created at src/modules/${name}/\n`);
console.log(`👉 Next steps:`);
console.log(`   1. Add fields to ${name}.interface.ts`);
console.log(`   2. Add schema fields to ${name}.model.ts`);
console.log(`   3. Add validation rules to ${name}.validate.ts`);
console.log(`   4. Register route in routes/v1/index.ts:\n`);
console.log(`      import ${name}Routes from '../../modules/${name}';`);
console.log(`      router.use('/${name}s', ${name}Routes);\n`);
// example
// npm run module:create products
