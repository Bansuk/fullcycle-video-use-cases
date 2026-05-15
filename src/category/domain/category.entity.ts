import { Entity } from '../../shared/domain/entity';
import { EntityValidationError } from '../../shared/domain/errors/validation.error';
import { CategoryValidatorFactory } from './category.validator';

export interface CategoryProps {
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: Date;
}

export class Category extends Entity<CategoryProps> {
  private constructor(props: CategoryProps, id?: string) {
    super(
      {
        ...props,
        description: props.description ?? null,
        is_active: props.is_active ?? true,
        created_at: props.created_at ?? new Date(),
      },
      id,
    );
  }

  static create(props: CategoryProps, id?: string): Category {
    const category = new Category(props, id);
    Category.validate(category.props);
    return category;
  }

  private static validate(props: CategoryProps): void {
    const validator = CategoryValidatorFactory.create();
    const isValid = validator.validate(props);
    if (!isValid) {
      throw new EntityValidationError(validator.errors!);
    }
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get is_active(): boolean {
    return this.props.is_active!;
  }

  get created_at(): Date {
    return this.props.created_at!;
  }

  changeName(name: string): void {
    Category.validate({ ...this.props, name });
    (this.props as CategoryProps).name = name;
  }

  changeDescription(description: string | null): void {
    (this.props as CategoryProps).description = description;
  }

  activate(): void {
    (this.props as CategoryProps).is_active = true;
  }

  deactivate(): void {
    (this.props as CategoryProps).is_active = false;
  }
}
