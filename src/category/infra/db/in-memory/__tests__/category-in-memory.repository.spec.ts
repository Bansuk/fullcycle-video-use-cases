import { Category } from '../../../../domain/category.entity';
import { SearchParams, SearchResult } from '../../../../../shared/domain/repository/repository-interface';
import { CategoryInMemoryRepository } from '../category-in-memory.repository';

describe('CategoryInMemoryRepository', () => {
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
  });

  describe('insert()', () => {
    it('should insert a category', async () => {
      const category = Category.create({ name: 'Movies' });
      await repository.insert(category);
      const found = await repository.findById(category.id);
      expect(found).toBe(category);
    });

    it('should store multiple categories', async () => {
      const cat1 = Category.create({ name: 'Movies' });
      const cat2 = Category.create({ name: 'Series' });
      await repository.insert(cat1);
      await repository.insert(cat2);
      expect((await repository.findAll()).length).toBe(2);
    });
  });

  describe('findById()', () => {
    it('should return null when category is not found', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });

    it('should return the category when found', async () => {
      const category = Category.create({ name: 'Movies' });
      await repository.insert(category);
      const found = await repository.findById(category.id);
      expect(found).toBe(category);
    });
  });

  describe('findAll()', () => {
    it('should return empty array when repository is empty', async () => {
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });

    it('should return all inserted categories', async () => {
      const cat1 = Category.create({ name: 'Movies' });
      const cat2 = Category.create({ name: 'Series' });
      await repository.insert(cat1);
      await repository.insert(cat2);
      const all = await repository.findAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(cat1);
      expect(all).toContain(cat2);
    });

    it('should return a copy — mutations to the result do not affect the store', async () => {
      const category = Category.create({ name: 'Movies' });
      await repository.insert(category);
      const all = await repository.findAll();
      all.pop();
      expect((await repository.findAll()).length).toBe(1);
    });
  });

  describe('update()', () => {
    it('should update a category', async () => {
      const category = Category.create({ name: 'Movies' });
      await repository.insert(category);
      category.changeName('Updated Movies');
      await repository.update(category);
      const found = await repository.findById(category.id);
      expect(found!.name).toBe('Updated Movies');
    });

    it('should throw when category does not exist', async () => {
      const category = Category.create({ name: 'Movies' });
      await expect(repository.update(category)).rejects.toThrow(
        `Entity not found: ${category.id}`,
      );
    });
  });

  describe('delete()', () => {
    it('should delete a category by id', async () => {
      const category = Category.create({ name: 'Movies' });
      await repository.insert(category);
      await repository.delete(category.id);
      const found = await repository.findById(category.id);
      expect(found).toBeNull();
    });

    it('should throw when category does not exist', async () => {
      await expect(repository.delete('non-existent-id')).rejects.toThrow(
        'Entity not found: non-existent-id',
      );
    });
  });

  describe('search() — filter by name', () => {
    it('should return all categories when no filter is provided', async () => {
      const cat1 = Category.create({ name: 'Movies' });
      const cat2 = Category.create({ name: 'Series' });
      await repository.insert(cat1);
      await repository.insert(cat2);

      const result = await repository.search(new SearchParams());
      expect(result.items).toHaveLength(2);
    });

    it('should filter categories by name substring (case-insensitive)', async () => {
      const cat1 = Category.create({ name: 'Movies' });
      const cat2 = Category.create({ name: 'Series' });
      const cat3 = Category.create({ name: 'Movie Classics' });
      await repository.insert(cat1);
      await repository.insert(cat2);
      await repository.insert(cat3);

      const result = await repository.search(new SearchParams({ filter: 'movie' }));
      expect(result.items).toHaveLength(2);
      expect(result.items).toContain(cat1);
      expect(result.items).toContain(cat3);
    });

    it('should filter categories with term in any part of the name', async () => {
      const cat1 = Category.create({ name: 'Action Movies' });
      const cat2 = Category.create({ name: 'Horror Documentaries' });
      await repository.insert(cat1);
      await repository.insert(cat2);

      const result = await repository.search(new SearchParams({ filter: 'doc' }));
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBe(cat2);
    });

    it('should return empty array when filter matches nothing', async () => {
      await repository.insert(Category.create({ name: 'Movies' }));
      const result = await repository.search(new SearchParams({ filter: 'xyz123' }));
      expect(result.items).toHaveLength(0);
    });

    it('should update total based on filtered items', async () => {
      await repository.insert(Category.create({ name: 'Action Movies' }));
      await repository.insert(Category.create({ name: 'Drama Series' }));
      await repository.insert(Category.create({ name: 'Animated Movies' }));

      const result = await repository.search(new SearchParams({ filter: 'Movies' }));
      expect(result.total).toBe(2);
    });
  });

  describe('search() — default sort by created_at', () => {
    it('should sort by created_at descending when no sort is specified', async () => {
      const older = new Date('2024-01-01');
      const newer = new Date('2024-06-01');
      const cat1 = Category.create({ name: 'Movies', created_at: older });
      const cat2 = Category.create({ name: 'Series', created_at: newer });
      await repository.insert(cat1);
      await repository.insert(cat2);

      const result = await repository.search(new SearchParams());
      expect(result.items[0]).toBe(cat2);
      expect(result.items[1]).toBe(cat1);
    });

    it('should maintain created_at desc order for multiple items', async () => {
      const dates = [
        new Date('2024-03-01'),
        new Date('2024-01-01'),
        new Date('2024-06-01'),
      ];
      const names = ['March', 'January', 'June'];
      for (let i = 0; i < names.length; i++) {
        await repository.insert(Category.create({ name: names[i], created_at: dates[i] }));
      }

      const result = await repository.search(new SearchParams());
      expect(result.items[0].name).toBe('June');
      expect(result.items[1].name).toBe('March');
      expect(result.items[2].name).toBe('January');
    });
  });

  describe('search() — explicit sort', () => {
    it('should sort by name ascending', async () => {
      await repository.insert(Category.create({ name: 'Zombie Movies' }));
      await repository.insert(Category.create({ name: 'Action Movies' }));
      await repository.insert(Category.create({ name: 'Manga' }));

      const result = await repository.search(new SearchParams({ sort: 'name', sort_dir: 'asc' }));
      expect(result.items[0].name).toBe('Action Movies');
      expect(result.items[1].name).toBe('Manga');
      expect(result.items[2].name).toBe('Zombie Movies');
    });

    it('should sort by name descending', async () => {
      await repository.insert(Category.create({ name: 'Zombie Movies' }));
      await repository.insert(Category.create({ name: 'Action Movies' }));
      await repository.insert(Category.create({ name: 'Manga' }));

      const result = await repository.search(
        new SearchParams({ sort: 'name', sort_dir: 'desc' }),
      );
      expect(result.items[0].name).toBe('Zombie Movies');
      expect(result.items[1].name).toBe('Manga');
      expect(result.items[2].name).toBe('Action Movies');
    });

    it('should default to created_at sort when sort field is not in sortableFields', async () => {
      const older = new Date('2024-01-01');
      const newer = new Date('2024-12-01');
      await repository.insert(Category.create({ name: 'B', created_at: older }));
      await repository.insert(Category.create({ name: 'A', created_at: newer }));

      const result = await repository.search(
        new SearchParams({ sort: 'unknown_field', sort_dir: 'asc' }),
      );
      expect(result.items[0].name).toBe('A');
      expect(result.items[1].name).toBe('B');
    });
  });

  describe('search() — pagination', () => {
    it('should return first page of results', async () => {
      const created_at = new Date();
      for (let i = 1; i <= 5; i++) {
        await repository.insert(Category.create({ name: `Category ${i}`, created_at }));
      }

      const result = await repository.search(new SearchParams({ sort: 'name', sort_dir: 'asc', page: 1, per_page: 2 }));
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.last_page).toBe(3);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(2);
    });

    it('should return correct items for page 2', async () => {
      const created_at = new Date();
      const names = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      for (const name of names) {
        await repository.insert(Category.create({ name, created_at }));
      }

      const result = await repository.search(
        new SearchParams({ sort: 'name', sort_dir: 'asc', page: 2, per_page: 2 }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Delta');
      expect(result.items[1].name).toBe('Gamma');
    });

    it('should return empty items for page beyond last_page', async () => {
      await repository.insert(Category.create({ name: 'Movies' }));

      const result = await repository.search(new SearchParams({ page: 10, per_page: 15 }));
      expect(result.items).toHaveLength(0);
    });

    it('should use default per_page of 15 when not specified', async () => {
      const result = await repository.search(new SearchParams({ page: 1 }));
      expect(result.per_page).toBe(15);
    });
  });

  describe('search() — SearchResult shape', () => {
    it('should return a SearchResult instance', async () => {
      const result = await repository.search(new SearchParams());
      expect(result).toBeInstanceOf(SearchResult);
    });

    it('should include correct metadata in result', async () => {
      await repository.insert(Category.create({ name: 'Action Movies' }));
      await repository.insert(Category.create({ name: 'Horror Movies' }));

      const result = await repository.search(
        new SearchParams({ filter: 'movies', page: 1, per_page: 10 }),
      );
      expect(result.total).toBe(2);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(10);
      expect(result.last_page).toBe(1);
      expect(result.filter).toBe('movies');
      expect(result.sort).toBeNull();
      expect(result.sort_dir).toBeNull();
    });

    it('should calculate last_page correctly', async () => {
      const created_at = new Date();
      for (let i = 1; i <= 10; i++) {
        await repository.insert(Category.create({ name: `Category ${i}`, created_at }));
      }

      const result = await repository.search(new SearchParams({ page: 1, per_page: 3 }));
      expect(result.total).toBe(10);
      expect(result.last_page).toBe(4);
    });
  });
});
