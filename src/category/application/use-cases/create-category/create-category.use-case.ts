import { Category } from '../../../domain/category.entity';
import { ICategoryRepository } from '../../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from '../../category-output';

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export type CreateCategoryOutput = CategoryOutput;

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const entity = Category.create(input);
    await this.categoryRepo.insert(entity);
    return CategoryOutputMapper.toOutput(entity);
  }
}
