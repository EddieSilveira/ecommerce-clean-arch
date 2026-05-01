import { prismaTest, clearDatabase } from "../setup/prisma";
import { UserPrismaRepository } from "@infra/repositories/user.repository";
import { User } from "@domain/user/entities/user.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const repo = new UserPrismaRepository(prismaTest);

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await prismaTest.$disconnect();
});

async function makeUser(overrides?: Partial<{ name: string; email: string; passwordHash: string; role: 'ADMIN' | 'CUSTOMER' }>): Promise<User> {
  const user = User.create({
    name: overrides?.name ?? "Alice",
    email: overrides?.email ?? "alice@example.com",
    passwordHash: overrides?.passwordHash ?? "hashed_password",
    role: overrides?.role,
  });
  await repo.save(user);
  return user;
}

describe("UserPrismaRepository", () => {
  describe("save + findById", () => {
    it("persists a user and retrieves it by id", async () => {
      const user = await makeUser();

      const found = await repo.findById(user.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(user.getId().getValue());
      expect(found!.getName()).toBe("Alice");
      expect(found!.getEmail()).toBe("alice@example.com");
    });

    it("returns null for unknown id", async () => {
      const result = await repo.findById(UUID.create());
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("finds user by email", async () => {
      const user = await makeUser({ email: "bob@example.com" });
      const found = await repo.findByEmail("bob@example.com");
      expect(found!.getId().getValue()).toBe(user.getId().getValue());
    });

    it("returns null for unknown email", async () => {
      const result = await repo.findByEmail("unknown@example.com");
      expect(result).toBeNull();
    });
  });

  describe("findByResetToken", () => {
    it("finds user by reset token", async () => {
      const user = await makeUser();
      user.setResetToken("my-reset-token", new Date(Date.now() + 3600_000));
      await repo.save(user);

      const found = await repo.findByResetToken("my-reset-token");
      expect(found!.getId().getValue()).toBe(user.getId().getValue());
    });

    it("returns null for unknown token", async () => {
      const result = await repo.findByResetToken("nonexistent-token");
      expect(result).toBeNull();
    });
  });

  describe("save (update)", () => {
    it("updates an existing user", async () => {
      const user = await makeUser({ name: "Before" });
      user.update({ name: "After" });
      await repo.save(user);

      const found = await repo.findById(user.getId());
      expect(found!.getName()).toBe("After");
    });
  });

  describe("delete", () => {
    it("removes the user", async () => {
      const user = await makeUser();
      await repo.delete(user.getId());
      const found = await repo.findById(user.getId());
      expect(found).toBeNull();
    });
  });

  describe("role", () => {
    it("defaults to CUSTOMER when not specified", async () => {
      const user = await makeUser();
      const found = await repo.findById(user.getId());
      expect(found!.getRole()).toBe('CUSTOMER');
    });

    it("persists ADMIN role", async () => {
      const user = await makeUser({ email: "admin@example.com", role: 'ADMIN' });
      const found = await repo.findById(user.getId());
      expect(found!.getRole()).toBe('ADMIN');
    });
  });
});
