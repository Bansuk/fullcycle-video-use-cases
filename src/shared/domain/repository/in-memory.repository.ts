import { Entity } from '../entity';
import {
  IRepository,
  ISearchableRepository,
  SearchParams,
  SearchResult,
  SortDirection,
} from './repository-interface';

export abstract class InMemoryRepository<E extends Entity<any>> implements IRepository<E> {
  protected items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async findById(id: string): Promise<E | null> {
    return this.items.find(item => item.id === id) ?? null;
  }

  async findAll(): Promise<E[]> {
    return [...this.items];
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex(item => item.id === entity.id);
    if (index === -1) {
      throw new Error(`Entity not found: ${entity.id}`);
    }
    this.items[index] = entity;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Entity not found: ${id}`);
    }
    this.items.splice(index, 1);
  }
}

export abstract class InMemorySearchableRepository<E extends Entity<any>, Filter = string>
  extends InMemoryRepository<E>
  implements ISearchableRepository<E, Filter>
{
  sortableFields: string[] = [];

  async search(params: SearchParams<Filter>): Promise<SearchResult<E, Filter>> {
    const filtered = await this.applyFilter(this.items, params.filter);
    const sorted = this.applySort(filtered, params.sort, params.sort_dir);
    const paginated = this.applyPaginate(sorted, params.page, params.per_page);

    return new SearchResult<E, Filter>({
      items: paginated,
      total: filtered.length,
      current_page: params.page,
      per_page: params.per_page,
      sort: params.sort,
      sort_dir: params.sort_dir,
      filter: params.filter,
    });
  }

  protected abstract applyFilter(items: E[], filter: Filter | null): Promise<E[]>;

  protected applySort(
    items: E[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ): E[] {
    if (!sort || !this.sortableFields.includes(sort)) {
      return [...items].sort((a, b) => {
        const aDate = (a.props as any).created_at as Date;
        const bDate = (b.props as any).created_at as Date;
        if (aDate > bDate) return -1;
        if (aDate < bDate) return 1;
        return 0;
      });
    }

    return [...items].sort((a, b) => {
      const aValue = (a.props as any)[sort];
      const bValue = (b.props as any)[sort];
      if (aValue < bValue) return sort_dir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort_dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  protected applyPaginate(items: E[], page: number, per_page: number): E[] {
    const start = (page - 1) * per_page;
    return items.slice(start, start + per_page);
  }
}
