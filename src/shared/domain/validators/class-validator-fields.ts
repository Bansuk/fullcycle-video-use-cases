import 'reflect-metadata';
import { validateSync, ValidationError } from 'class-validator';
import { FieldsErrors, IValidatorFields } from './validator-interface';

export abstract class ClassValidatorFields<PropsValidated>
  implements IValidatorFields<PropsValidated>
{
  errors: FieldsErrors | null = null;
  validatedData: PropsValidated | null = null;

  validate(data: any): boolean {
    const errors = validateSync(data);
    if (errors.length) {
      this.errors = {};
      for (const error of errors) {
        this.collectErrors(error);
      }
      return false;
    }
    this.validatedData = data;
    return true;
  }

  private collectErrors(error: ValidationError): void {
    if (error.constraints) {
      const field = error.property;
      this.errors![field] = Object.values(error.constraints);
    }
    if (error.children?.length) {
      error.children.forEach(child => this.collectErrors(child));
    }
  }
}
