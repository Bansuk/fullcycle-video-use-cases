function generateUUID(): string {
  // Use Node.js built-in crypto.randomUUID() (available since Node 14.17+)
  return crypto.randomUUID();
}

export abstract class Entity<T> {
  public readonly id: string;
  public readonly props: T;

  constructor(props: T, id?: string) {
    this.id = id ?? generateUUID();
    this.props = props;
    // Make id and props non-writable at runtime to enforce immutability
    Object.defineProperty(this, 'id', {
      value: this.id,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(this, 'props', {
      value: this.props,
      writable: false,
      configurable: false,
      enumerable: true,
    });
  }
}
