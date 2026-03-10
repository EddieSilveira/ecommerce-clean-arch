import { Password } from "@domain/shared/value-objects/password.vo";

const validPassword = "StrongP@ss1";

describe("Password", () => {
  it("should create a valid password", () => {
    const password = Password.create(validPassword);
    expect(password.getValue()).toBe(validPassword);
  });

  it("should throw when shorter than 8 characters", () => {
    expect(() => Password.create("Ab1@")).toThrow("Password must be at least 8 characters");
  });

  it("should throw when empty", () => {
    expect(() => Password.create("")).toThrow("Password must be at least 8 characters");
  });

  it("should throw when missing uppercase letter", () => {
    expect(() => Password.create("strongp@ss1")).toThrow("Password must contain at least one uppercase letter");
  });

  it("should throw when missing lowercase letter", () => {
    expect(() => Password.create("STRONGP@SS1")).toThrow("Password must contain at least one lowercase letter");
  });

  it("should throw when missing number", () => {
    expect(() => Password.create("StrongP@ss")).toThrow("Password must contain at least one number");
  });

  it("should throw when missing special character", () => {
    expect(() => Password.create("StrongPass1")).toThrow("Password must contain at least one special character");
  });

  it("should accept different valid special characters", () => {
    expect(() => Password.create("StrongP#ss1")).not.toThrow();
    expect(() => Password.create("StrongP!ss1")).not.toThrow();
    expect(() => Password.create("StrongP$ss1")).not.toThrow();
  });
});
