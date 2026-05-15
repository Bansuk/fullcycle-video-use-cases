import { Category } from '../../../../domain/category.entity';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { EntityValidationError } from '../../../../../shared/domain/errors/validation.error';
import { UpdateCategoryUseCase } from '../update-category.use-case';

describe('UpdateCategoryUseCase', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: UpdateCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should update category name', async () => {
    const category = Category.create({ name: 'Movie' });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id, name: 'Documentary' });

    expect(output.name).toBe('Documentary');
    expect(output.id).toBe(category.id);
  });

  it('should update category description', async () => {
    const category = Category.create({ name: 'Movie', description: 'Old description' });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id, description: 'New description' });

    expect(output.description).toBe('New description');
    expect(output.name).toBe('Movie');
  });

  it('should set description to null', async () => {
    const category = Category.create({ name: 'Movie', description: 'Some description' });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id, description: null });

    expect(output.description).toBeNull();
  });

  it('should activate a category', async () => {
    const category = Category.create({ name: 'Movie', is_active: false });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id, is_active: true });

    expect(output.is_active).toBe(true);
  });

  it('should deactivate a category', async () => {
    const category = Category.create({ name: 'Movie', is_active: true });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id, is_active: false });

    expect(output.is_active).toBe(false);
  });

  it('should update multiple fields at once', async () => {
    const category = Category.create({ name: 'Movie', description: 'Old', is_active: true });
    await repository.insert(category);

    const output = await useCase.execute({
      id: category.id,
      name: 'Comedy',
      description: 'New',
      is_active: false,
    });

    expect(output.name).toBe('Comedy');
    expect(output.description).toBe('New');
    expect(output.is_active).toBe(false);
  });

  it('should not change fields not provided', async () => {
    const category = Category.create({ name: 'Movie', description: 'Keep this', is_active: true });
    await repository.insert(category);

    const output = await useCase.execute({ id: category.id, name: 'Documentary' });

    expect(output.name).toBe('Documentary');
    expect(output.description).toBe('Keep this');
    expect(output.is_active).toBe(true);
  });

  it('should throw error when category not found', async () => {
    await expect(
      useCase.execute({ id: 'non-existent-id', name: 'Movie' }),
    ).rejects.toThrow('not found');
  });

  it('should throw EntityValidationError for invalid name', async () => {
    const category = Category.create({ name: 'Movie' });
    await repository.insert(category);

    await expect(useCase.execute({ id: category.id, name: '' })).rejects.toThrow(
      EntityValidationError,
    );
  });

  it('should persist updated entity in repository', async () => {
    const category = Category.create({ name: 'Movie' });
    await repository.insert(category);

    await useCase.execute({ id: category.id, name: 'Updated Movie' });

    const stored = await repository.findById(category.id);
    expect(stored!.name).toBe('Updated Movie');
  });
});
