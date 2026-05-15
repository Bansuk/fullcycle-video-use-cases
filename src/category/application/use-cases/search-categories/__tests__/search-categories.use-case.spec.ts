import { Category } from '../../../../domain/category.entity';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { SearchCategoriesUseCase } from '../search-categories.use-case';

describe('SearchCategoriesUseCase', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: SearchCategoriesUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new SearchCategoriesUseCase(repository);
  });

  it('should return empty result when no categories exist', async () => {
    const output = await useCase.execute({});

    expect(output.items).toHaveLength(0);
    expect(output.total).toBe(0);
    expect(output.current_page).toBe(1);
    expect(output.last_page).toBe(0);
  });

  it('should return all categories with default params', async () => {
    await repository.insert(Category.create({ name: 'Movie' }));
    await repository.insert(Category.create({ name: 'Documentary' }));

    const output = await useCase.execute({});

    expect(output.items).toHaveLength(2);
    expect(output.total).toBe(2);
  });

  it('should filter categories by name (case-insensitive)', async () => {
    await repository.insert(Category.create({ name: 'Movie' }));
    await repository.insert(Category.create({ name: 'movie action' }));
    await repository.insert(Category.create({ name: 'Documentary' }));

    const output = await useCase.execute({ filter: 'movie' });

    expect(output.items).toHaveLength(2);
    expect(output.filter).toBe('movie');
  });

  it('should sort by name ascending', async () => {
    await repository.insert(Category.create({ name: 'Zombie' }));
    await repository.insert(Category.create({ name: 'Action' }));
    await repository.insert(Category.create({ name: 'Movie' }));

    const output = await useCase.execute({ sort: 'name', sort_dir: 'asc' });

    expect(output.items[0].name).toBe('Action');
    expect(output.items[1].name).toBe('Movie');
    expect(output.items[2].name).toBe('Zombie');
    expect(output.sort).toBe('name');
    expect(output.sort_dir).toBe('asc');
  });

  it('should sort by name descending', async () => {
    await repository.insert(Category.create({ name: 'Action' }));
    await repository.insert(Category.create({ name: 'Zombie' }));
    await repository.insert(Category.create({ name: 'Movie' }));

    const output = await useCase.execute({ sort: 'name', sort_dir: 'desc' });

    expect(output.items[0].name).toBe('Zombie');
    expect(output.items[1].name).toBe('Movie');
    expect(output.items[2].name).toBe('Action');
  });

  it('should paginate results', async () => {
    for (let i = 1; i <= 5; i++) {
      await repository.insert(Category.create({ name: `Category ${i}` }));
    }

    const output = await useCase.execute({ page: 1, per_page: 2 });

    expect(output.items).toHaveLength(2);
    expect(output.total).toBe(5);
    expect(output.current_page).toBe(1);
    expect(output.per_page).toBe(2);
    expect(output.last_page).toBe(3);
  });

  it('should return second page', async () => {
    for (let i = 1; i <= 4; i++) {
      await repository.insert(Category.create({ name: `Category ${String(i).padStart(2, '0')}` }));
    }

    const output = await useCase.execute({ page: 2, per_page: 2, sort: 'name', sort_dir: 'asc' });

    expect(output.items).toHaveLength(2);
    expect(output.current_page).toBe(2);
    expect(output.items[0].name).toBe('Category 03');
  });

  it('should map output fields correctly', async () => {
    const category = Category.create({ name: 'Movie', description: 'Action films', is_active: true });
    await repository.insert(category);

    const output = await useCase.execute({});

    expect(output.items[0]).toMatchObject({
      id: category.id,
      name: 'Movie',
      description: 'Action films',
      is_active: true,
    });
    expect(output.items[0].created_at).toBeInstanceOf(Date);
  });

  it('should return correct metadata with no sort', async () => {
    await repository.insert(Category.create({ name: 'Movie' }));

    const output = await useCase.execute({ filter: null, sort: null });

    expect(output.sort).toBeNull();
    expect(output.sort_dir).toBeNull();
    expect(output.filter).toBeNull();
  });
});
