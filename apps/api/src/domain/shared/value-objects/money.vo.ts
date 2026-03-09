export class Money {
  private constructor(private readonly amount: number) {}

  static create(amount: number): Money {
    if (amount < 0) throw new Error("Value cannot be negative");
    return new Money(Math.round(amount * 100) / 100);
  }

  add(other: Money): Money {
    return Money.create(this.amount + other.amount);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor);
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  getValue(): number {
    return this.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }
}