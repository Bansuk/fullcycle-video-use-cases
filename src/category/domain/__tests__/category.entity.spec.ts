import { Category } from '../category.entity';
import { EntityValidationError } from '../../../shared/domain/errors/validation.error';

describe('Category Entity', () => {
  describe('Constructor / defaults', () => {
    it('should create a category with all props provided', () => {
      const created_at = new Date('2024-01-01');
      const category = Category.create({
        name: 'Movies',
        description: 'Movie category',
        is_active: false,
        created_at,
      });

      expect(category.name).toBe('Movies');
      expect(category.description).toBe('Movie category');
      expect(category.is_active).toBe(false);
      expect(category.created_at).toBe(created_at);
    });

    it('should create a category with only name and apply defaults', () => {
      const before = new Date();
      const category = Category.create({ name: 'Series' });
      const after = new Date();

      expect(category.name).toBe('Series');
      expect(category.description).toBeNull();
      expect(category.is_active).toBe(true);
      expect(category.created_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(category.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should auto-generate an id when none is provided', () => {
      const category = Category.create({ name: 'Documentaries' });
      expect(category.id).toBeDefined();
      expect(typeof category.id).toBe('string');
      expect(category.id.length).toBeGreaterThan(0);
    });

    it('should use the provided id when given', () => {
      const id = 'b1f2c3d4-e5f6-7890-abcd-ef1234567890';
      const category = Category.create({ name: 'Anime' }, id);
      expect(category.id).toBe(id);
    });
  });

  describe('Factory — Category.create()', () => {
    it('should return a Category instance', () => {
      const category = Category.create({ name: 'Horror' });
      expect(category).toBeInstanceOf(Category);
    });

    it('should set description to null by default', () => {
      const category = Category.create({ name: 'Comedy' });
      expect(category.description).toBeNull();
    });

    it('should accept an explicit null description', () => {
      const category = Category.create({ name: 'Action', description: null });
      expect(category.description).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should throw EntityValidationError when name is empty string', () => {
      expect(() => Category.create({ name: '' })).toThrow(EntityValidationError);
    });

    it('should include name field in errors when name is empty', () => {
      let error: EntityValidationError | undefined;
      try {
        Category.create({ name: '' });
      } catch (e) {
        error = e as EntityValidationError;
      }
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error!.error).toHaveProperty('name');
    });

    it('should throw EntityValidationError when name is whitespace only', () => {
      expect(() => Category.create({ name: '   ' })).toThrow(EntityValidationError);
    });

    it('should include name field in errors when name is whitespace only', () => {
      let error: EntityValidationError | undefined;
      try {
        Category.create({ name: '   ' });
      } catch (e) {
        error = e as EntityValidationError;
      }
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error!.error).toHaveProperty('name');
    });

    it('should throw EntityValidationError when name exceeds 255 characters', () => {
      const longName = 'a'.repeat(256);
      expect(() => Category.create({ name: longName })).toThrow(EntityValidationError);
    });

    it('should include name field in errors when name exceeds 255 characters', () => {
      let error: EntityValidationError | undefined;
      try {
        Category.create({ name: 'a'.repeat(256) });
      } catch (e) {
        error = e as EntityValidationError;
      }
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error!.error).toHaveProperty('name');
    });

    it('should succeed when name is exactly 255 characters', () => {
      const exactName = 'a'.repeat(255);
      const category = Category.create({ name: exactName });
      expect(category.name).toBe(exactName);
      expect(category.name.length).toBe(255);
    });
  });

  describe('changeName()', () => {
    it('should update the name to a valid value', () => {
      const category = Category.create({ name: 'OldName' });
      category.changeName('NewName');
      expect(category.name).toBe('NewName');
    });

    it('should throw EntityValidationError when new name is empty', () => {
      const category = Category.create({ name: 'ValidName' });
      expect(() => category.changeName('')).toThrow(EntityValidationError);
    });

    it('should throw EntityValidationError when new name is too long', () => {
      const category = Category.create({ name: 'ValidName' });
      expect(() => category.changeName('x'.repeat(256))).toThrow(EntityValidationError);
    });

    it('should not change name when validation fails', () => {
      const category = Category.create({ name: 'ValidName' });
      try {
        category.changeName('');
      } catch {
        // expected
      }
      expect(category.name).toBe('ValidName');
    });
  });

  describe('changeDescription()', () => {
    it('should update the description', () => {
      const category = Category.create({ name: 'Movies', description: 'Old description' });
      category.changeDescription('New description');
      expect(category.description).toBe('New description');
    });

    it('should allow setting description to null', () => {
      const category = Category.create({ name: 'Movies', description: 'Some description' });
      category.changeDescription(null);
      expect(category.description).toBeNull();
    });
  });

  describe('activate() / deactivate()', () => {
    it('should activate a deactivated category', () => {
      const category = Category.create({ name: 'Movies', is_active: false });
      expect(category.is_active).toBe(false);
      category.activate();
      expect(category.is_active).toBe(true);
    });

    it('should deactivate an active category', () => {
      const category = Category.create({ name: 'Movies', is_active: true });
      expect(category.is_active).toBe(true);
      category.deactivate();
      expect(category.is_active).toBe(false);
    });

    it('should remain active if activate is called on an already active category', () => {
      const category = Category.create({ name: 'Movies' });
      category.activate();
      expect(category.is_active).toBe(true);
    });

    it('should remain inactive if deactivate is called on an already inactive category', () => {
      const category = Category.create({ name: 'Movies', is_active: false });
      category.deactivate();
      expect(category.is_active).toBe(false);
    });
  });

  describe('ID generation', () => {
    it('should generate different ids for different instances', () => {
      const cat1 = Category.create({ name: 'Cat1' });
      const cat2 = Category.create({ name: 'Cat2' });
      expect(cat1.id).not.toBe(cat2.id);
    });

    it('should have a UUID-like id format', () => {
      const category = Category.create({ name: 'Movies' });
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(category.id)).toBe(true);
    });
  });

  describe('Immutability', () => {
    it('should not allow direct assignment to props', () => {
      const category = Category.create({ name: 'Movies' });
      const descriptor = Object.getOwnPropertyDescriptor(category, 'props');
      expect(descriptor?.writable).toBe(false);
    });

    it('should not allow direct assignment to id', () => {
      const category = Category.create({ name: 'Movies' });
      const descriptor = Object.getOwnPropertyDescriptor(category, 'id');
      expect(descriptor?.writable).toBe(false);
    });
  });
});
