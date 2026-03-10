import { Money } from "@domain/shared/value-objects/money.vo";

describe("Money", () => {
  it("should create a valid money", () => {
    const money = Money.create(10.5);
    expect(money.getValue()).toBe(10.5);
  });

  it("should throw when negative", () => {
    expect(() => Money.create(-1)).toThrow("Value cannot be negative");
  });

  it("should allow zero", () => {
    expect(() => Money.create(0)).not.toThrow();
  });

  it("should add two money values", () => {
    const total = Money.create(10).add(Money.create(5));
    expect(total.getValue()).toBe(15);
  });

  it("should multiply", () => {
    const total = Money.create(10).multiply(3);
    expect(total.getValue()).toBe(30);
  });

  it("should avoid floating point issues", () => {
    const total = Money.create(0.1).add(Money.create(0.2));
    expect(total.getValue()).toBe(0.3);
  });

  it("should compare with isGreaterThan", () => {
    expect(Money.create(10).isGreaterThan(Money.create(5))).toBe(true);
    expect(Money.create(5).isGreaterThan(Money.create(10))).toBe(false);
    expect(Money.create(10).isGreaterThan(Money.create(10))).toBe(false);
  });

  it("should compare equality", () => {
    expect(Money.create(10).equals(Money.create(10))).toBe(true);
    expect(Money.create(10).equals(Money.create(11))).toBe(false);
  });

  it("should be immutable — add returns a new instance", () => {
    const original = Money.create(10);
    const result = original.add(Money.create(5));
    expect(original.getValue()).toBe(10);
    expect(result.getValue()).toBe(15);
  });
});