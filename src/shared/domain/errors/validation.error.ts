export class EntityValidationError extends Error {
  constructor(
    public error: Record<string, string[]>,
    message = 'Validation Error',
  ) {
    super(message);
    this.name = 'EntityValidationError';
  }
}
