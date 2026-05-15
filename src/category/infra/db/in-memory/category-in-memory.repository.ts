import { InMemorySearchableRepository } from '../../../../shared/domain/repository/in-memory.repository';
import { SearchParams, SearchResult } from '../../../../shared/domain/repository/repository-interface';
import { Category } from '../../../domain/category.entity';
import { CategoryFilter, ICategoryRepository } from '../../../domain/category.repository';

export class CategoryInMemoryRepository
  extends InMemorySearchableRepository<Category, CategoryFilter>
  implements ICategoryRepository
{
  sortableFields = ['name', 'created_at'];

  protected async applyFilter(
    items: Category[],
    filter: CategoryFilter | null,
  ): Promise<Category[]> {
    if (!filter) {
      return items;
    }
    return items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
  }

  async search(
    params: SearchParams<CategoryFilter>,
  ): Promise<SearchResult<Category, CategoryFilter>> {
    return super.search(params);
  }
}
