import { UUID } from "@domain/shared/value-objects/uuid.vo";

describe("UUID", () => {
  it("should generate a valid UUID automatically", () => {
    const uuid = UUID.create();
    expect(uuid.getValue()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("should accept a valid UUID string", () => {
    const value = "550e8400-e29b-41d4-a716-446655440000";
    const uuid = UUID.create(value);
    expect(uuid.getValue()).toBe(value);
  });

  it("should throw if UUID string is invalid", () => {
    expect(() => UUID.create("not-a-uuid")).toThrow("Invalid UUID");
  });

  it("should throw if UUID string is empty", () => {
    expect(() => UUID.create("")).toThrow("Invalid UUID");
  });

  it("should return true for equals when values are the same", () => {
    const value = "550e8400-e29b-41d4-a716-446655440000";
    const a = UUID.create(value);
    const b = UUID.create(value);
    expect(a.equals(b)).toBe(true);
  });

  it("should return false for equals when values differ", () => {
    const a = UUID.create();
    const b = UUID.create();
    expect(a.equals(b)).toBe(false);
  });

  it("should return the value via toString", () => {
    const value = "550e8400-e29b-41d4-a716-446655440000";
    const uuid = UUID.create(value);
    expect(uuid.toString()).toBe(value);
  });
});
