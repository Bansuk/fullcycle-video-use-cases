import { ICategoryRepository } from '../../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from '../../category-output';

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

export type UpdateCategoryOutput = CategoryOutput;

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const entity = await this.categoryRepo.findById(input.id);
    if (!entity) {
      throw new Error(`Category with id ${input.id} not found`);
    }

    if (input.name !== undefined) {
      entity.changeName(input.name);
    }
    if ('description' in input) {
      entity.changeDescription(input.description ?? null);
    }
    if (input.is_active !== undefined) {
      input.is_active ? entity.activate() : entity.deactivate();
    }

    await this.categoryRepo.update(entity);
    return CategoryOutputMapper.toOutput(entity);
  }
}
