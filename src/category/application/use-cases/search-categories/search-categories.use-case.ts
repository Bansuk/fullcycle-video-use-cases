import { ICategoryRepository } from '../../../domain/category.repository';
import { SearchParams, SortDirection } from '../../../../shared/domain/repository/repository-interface';
import { CategoryOutput, CategoryOutputMapper } from '../../category-output';

export type SearchCategoriesInput = {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: string | null;
};

export type SearchCategoriesOutput = {
  items: CategoryOutput[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
  sort: string | null;
  sort_dir: SortDirection | null;
  filter: string | null;
};

export class SearchCategoriesUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(input: SearchCategoriesInput): Promise<SearchCategoriesOutput> {
    const params = new SearchParams<string>(input);
    const result = await this.categoryRepo.search(params);

    return {
      items: result.items.map(CategoryOutputMapper.toOutput),
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      last_page: result.last_page,
      sort: result.sort,
      sort_dir: result.sort_dir,
      filter: result.filter,
    };
  }
}
