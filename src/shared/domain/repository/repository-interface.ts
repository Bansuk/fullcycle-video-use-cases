import { Entity } from '../entity';

export type SortDirection = 'asc' | 'desc';

export type SearchParamsProps<Filter = string> = {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: Filter | null;
};

export class SearchParams<Filter = string> {
  readonly page: number;
  readonly per_page: number;
  readonly sort: string | null;
  readonly sort_dir: SortDirection | null;
  readonly filter: Filter | null;

  constructor(props: SearchParamsProps<Filter> = {}) {
    this.page = this.normalizePageNumber(props.page);
    this.per_page = this.normalizePerPage(props.per_page);
    this.sort = props.sort ?? null;
    this.sort_dir = this.normalizeSortDir(props.sort, props.sort_dir);
    this.filter = props.filter ?? null;
  }

  private normalizePageNumber(page?: number): number {
    const _page = +(page ?? 0);
    return !Number.isNaN(_page) && _page > 0 && Number.isInteger(_page) ? _page : 1;
  }

  private normalizePerPage(per_page?: number): number {
    const _per_page = +(per_page ?? 0);
    return !Number.isNaN(_per_page) && _per_page > 0 && Number.isInteger(_per_page)
      ? _per_page
      : 15;
  }

  private normalizeSortDir(
    sort?: string | null,
    sort_dir?: SortDirection | null,
  ): SortDirection | null {
    if (!sort) return null;
    return sort_dir === 'asc' || sort_dir === 'desc' ? sort_dir : 'asc';
  }
}

export type SearchResultProps<E, Filter = string> = {
  items: E[];
  total: number;
  current_page: number;
  per_page: number;
  sort: string | null;
  sort_dir: SortDirection | null;
  filter: Filter | null;
};

export class SearchResult<E, Filter = string> {
  readonly items: E[];
  readonly total: number;
  readonly current_page: number;
  readonly per_page: number;
  readonly last_page: number;
  readonly sort: string | null;
  readonly sort_dir: SortDirection | null;
  readonly filter: Filter | null;

  constructor(props: SearchResultProps<E, Filter>) {
    this.items = props.items;
    this.total = props.total;
    this.current_page = props.current_page;
    this.per_page = props.per_page;
    this.last_page = Math.ceil(this.total / this.per_page);
    this.sort = props.sort;
    this.sort_dir = props.sort_dir;
    this.filter = props.filter;
  }
}

export interface IRepository<E extends Entity<any>> {
  insert(entity: E): Promise<void>;
  findById(id: string): Promise<E | null>;
  findAll(): Promise<E[]>;
  update(entity: E): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ISearchableRepository<
  E extends Entity<any>,
  Filter = string,
  SearchOutput = SearchResult<E, Filter>,
> extends IRepository<E> {
  sortableFields: string[];
  search(props: SearchParams<Filter>): Promise<SearchOutput>;
}
