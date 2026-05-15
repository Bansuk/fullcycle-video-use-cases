import { Category } from '../../../../domain/category.entity';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { GetCategoryUseCase } from '../get-category.use-case';

describe('GetCategoryUseCase', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: GetCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should return a category by id', async () => {
    const category = Category.create({ name: 'Movie', description: 'Action films' });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id });

    expect(output.id).toBe(category.id);
    expect(output.name).toBe('Movie');
    expect(output.description).toBe('Action films');
    expect(output.is_active).toBe(true);
    expect(output.created_at).toBeInstanceOf(Date);
  });

  it('should return correct category when multiple exist', async () => {
    const category1 = Category.create({ name: 'Movie' });
    const category2 = Category.create({ name: 'Documentary' });
    await repository.insert(category1);
    await repository.insert(category2);

    const output = await useCase.execute({ id: category2.id });

    expect(output.id).toBe(category2.id);
    expect(output.name).toBe('Documentary');
  });

  it('should return inactive category', async () => {
    const category = Category.create({ name: 'Movie', is_active: false });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id });

    expect(output.is_active).toBe(false);
  });

  it('should throw error when category not found', async () => {
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('not found');
  });

  it('should return category with null description', async () => {
    const category = Category.create({ name: 'Movie' });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id });

    expect(output.description).toBeNull();
  });
});
