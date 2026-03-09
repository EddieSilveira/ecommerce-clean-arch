export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    if (!value) {
      throw new Error("Email cannot be empty");
    }

    const email = value.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new Error("Invalid email");
    }

    return new Email(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}