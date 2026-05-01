import { User } from "@domain/user/entities/user.entity";


describe("User", () => {
  const validProps = () => ({
    name: "John Doe",
    email: "johndoe@email.com",
    passwordHash: "hashed_password",
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

  describe("role", () => {
    it("should default to CUSTOMER when role is not specified", () => {
      const user = User.create(validProps());
      expect(user.getRole()).toBe('CUSTOMER');
    });

    it("should accept ADMIN role", () => {
      const user = User.create({ ...validProps(), role: 'ADMIN' });
      expect(user.getRole()).toBe('ADMIN');
    });

    it("should preserve role through reconstruct", () => {
      const original = User.create({ ...validProps(), role: 'ADMIN' });
      const reconstructed = User.reconstruct({
        id: original.getId().getValue(),
        name: original.getName(),
        email: original.getEmail(),
        passwordHash: original.getPasswordHash(),
        role: 'ADMIN',
      });
      expect(reconstructed.getRole()).toBe('ADMIN');
    });
  });
});