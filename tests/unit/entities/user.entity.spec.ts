import { User } from "@domain/user/entities/user.entity";


describe("User", () => {
  const validProps = () => ({
    name: "John Doe",
    email: "johndoe@email.com",
  });

  describe("create", () => {
    it("should create a valid user", () => {
      const user = User.create(validProps());
      expect(user.getName()).toBe("John Doe");
      expect(user.getEmail()).toBe("johndoe@email.com");
    });

    it("should generate an id automatically", () => {
      const user = User.create(validProps());
      expect(user.getId()).toBeDefined();
    });

    it("should throw when name is empty", () => {
      expect(() => User.create({ ...validProps(), name: "" })).toThrow(
        "User name cannot be empty"
      );
    });

    it("should throw when email is empty", () => {
      expect(() => User.create({ ...validProps(), email: "" })).toThrow(
        "Email cannot be empty"
      );
    });

    it("should throw when email is invalid", () => {
      expect(() => User.create({ ...validProps(), email: "not-an-email" })).toThrow(
        "Invalid email"
      );
      expect(() => User.create({ ...validProps(), email: "missing@domain" })).toThrow(
        "Invalid email"
      );
      expect(() => User.create({ ...validProps(), email: "@nodomain.com" })).toThrow(
        "Invalid email"
      );
    });

    it("should accept valid email formats", () => {
      expect(() => User.create({ ...validProps(), email: "user.name+tag@domain.co" })).not.toThrow();
    });
  });
});