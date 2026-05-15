import { Category } from '../domain/category.entity';

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

export class CategoryOutputMapper {
  static toOutput(entity: Category): CategoryOutput {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      is_active: entity.is_active,
      created_at: entity.created_at,
    };
  }
}
