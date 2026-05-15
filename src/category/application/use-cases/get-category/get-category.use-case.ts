import { ICategoryRepository } from '../../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from '../../category-output';

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;

export class GetCategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const entity = await this.categoryRepo.findById(input.id);
    if (!entity) {
      throw new Error(`Category with id ${input.id} not found`);
    }
    return CategoryOutputMapper.toOutput(entity);
  }
}
