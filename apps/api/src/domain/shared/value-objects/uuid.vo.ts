export class UUID {
  private constructor(private readonly value: string) {}

  static create(value?: string): UUID {
    const uuid = value ?? crypto.randomUUID();

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(uuid)) {
      throw new Error("Invalid UUID");
    }

    return new UUID(uuid);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UUID): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}