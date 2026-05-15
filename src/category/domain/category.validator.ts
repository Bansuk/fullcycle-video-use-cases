import 'reflect-metadata';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import { CategoryProps } from './category.entity';

export class CategoryRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S+/, { message: 'name should not be empty' })
  name!: string;

  @IsString()
  @IsOptional()
  description!: string | null;

  @IsBoolean()
  @IsOptional()
  is_active!: boolean;

  @IsDate()
  @IsOptional()
  created_at!: Date;

  constructor({ name, description, is_active, created_at }: CategoryProps) {
    Object.assign(this, { name, description, is_active, created_at });
  }
}

export class CategoryValidator extends ClassValidatorFields<CategoryRules> {
  validate(data: CategoryProps): boolean {
    return super.validate(new CategoryRules(data ?? {}));
  }
}

export class CategoryValidatorFactory {
  static create(): CategoryValidator {
    return new CategoryValidator();
  }
}
