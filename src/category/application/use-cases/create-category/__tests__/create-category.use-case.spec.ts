import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { CreateCategoryUseCase } from '../create-category.use-case';
import { EntityValidationError } from '../../../../../shared/domain/errors/validation.error';

describe('CreateCategoryUseCase', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a category with required fields', async () => {
    const output = await useCase.execute({ name: 'Movie' });

    expect(output.id).toBeDefined();
    expect(output.name).toBe('Movie');
    expect(output.description).toBeNull();
    expect(output.is_active).toBe(true);
    expect(output.created_at).toBeInstanceOf(Date);
    expect(await repository.findAll()).toHaveLength(1);
  });

  it('should create a category with all optional fields', async () => {
    const output = await useCase.execute({
      name: 'Documentary',
      description: 'Real world stories',
      is_active: false,
    });

    expect(output.name).toBe('Documentary');
    expect(output.description).toBe('Real world stories');
    expect(output.is_active).toBe(false);
  });

  it('should create a category with null description', async () => {
    const output = await useCase.execute({ name: 'Comedy', description: null });

    expect(output.description).toBeNull();
  });

  it('should persist the entity in the repository', async () => {
    await useCase.execute({ name: 'Action' });
    await useCase.execute({ name: 'Drama' });

    expect(await repository.findAll()).toHaveLength(2);
  });

  it('should throw EntityValidationError for empty name', async () => {
    await expect(useCase.execute({ name: '' })).rejects.toThrow(EntityValidationError);
  });

  it('should throw EntityValidationError for whitespace-only name', async () => {
    await expect(useCase.execute({ name: '   ' })).rejects.toThrow(EntityValidationError);
  });

  it('should throw EntityValidationError when name exceeds 255 characters', async () => {
    await expect(useCase.execute({ name: 'a'.repeat(256) })).rejects.toThrow(EntityValidationError);
  });
});
