import {
  ISearchableRepository,
  SearchParams,
  SearchResult,
} from '../../shared/domain/repository/repository-interface';
import { Category } from './category.entity';

export type CategoryFilter = string;

export type CategorySearchParams = SearchParams<CategoryFilter>;

export type CategorySearchResult = SearchResult<Category, CategoryFilter>;

export interface ICategoryRepository
  extends ISearchableRepository<Category, CategoryFilter, CategorySearchResult> {}
