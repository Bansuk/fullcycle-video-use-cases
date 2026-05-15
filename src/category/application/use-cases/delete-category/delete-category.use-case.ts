import { ICategoryRepository } from '../../../domain/category.repository';

export type DeleteCategoryInput = {
  id: string;
};

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    const entity = await this.categoryRepo.findById(input.id);
    if (!entity) {
      throw new Error(`Category with id ${input.id} not found`);
    }
    await this.categoryRepo.delete(input.id);
  }
}
