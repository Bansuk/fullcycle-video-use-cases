import { Category } from '../../../../domain/category.entity';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: DeleteCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should delete a category', async () => {
    const category = Category.create({ name: 'Movie' });
    await repository.insert(category);

    await useCase.execute({ id: category.id });

    expect(await repository.findAll()).toHaveLength(0);
  });

  it('should delete the correct category when multiple exist', async () => {
    const category1 = Category.create({ name: 'Movie' });
    const category2 = Category.create({ name: 'Documentary' });
    await repository.insert(category1);
    await repository.insert(category2);

    await useCase.execute({ id: category1.id });

    const remaining = await repository.findAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(category2.id);
  });

  it('should throw error when category not found', async () => {
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('not found');
  });

  it('should return void on successful deletion', async () => {
    const category = Category.create({ name: 'Movie' });
    await repository.insert(category);

    const result = await useCase.execute({ id: category.id });

    expect(result).toBeUndefined();
  });
});
