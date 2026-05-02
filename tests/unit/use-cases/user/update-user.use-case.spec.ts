import { UpdateUserUseCase } from "@application/use-cases/user/update-user.use-case";
import { fakeUserRepository, fakeHasher } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed:oldpass" });

describe("UpdateUserUseCase", () => {
  it("should update the user name", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([user]), fakeHasher());

    await useCase.execute({ userId: user.getId().getValue(), name: "Jane Doe", actor: { id: user.getId().getValue(), role: 'CUSTOMER' } });

    expect(user.getName()).toBe("Jane Doe");
  });

  it("should update the user email", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([user]), fakeHasher());

    await useCase.execute({ userId: user.getId().getValue(), email: "jane@example.com", actor: { id: user.getId().getValue(), role: 'CUSTOMER' } });

    expect(user.getEmail()).toBe("jane@example.com");
  });

  it("should hash and update the password", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([user]), fakeHasher());

    await useCase.execute({ userId: user.getId().getValue(), password: "NewP@ss123", actor: { id: user.getId().getValue(), role: 'CUSTOMER' } });

    expect(user.getPasswordHash()).toBe("hashed:NewP@ss123");
  });

  it("should update multiple fields at once", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([user]), fakeHasher());

    await useCase.execute({ userId: user.getId().getValue(), name: "Jane Doe", email: "jane@example.com", actor: { id: user.getId().getValue(), role: 'CUSTOMER' } });

    expect(user.getName()).toBe("Jane Doe");
    expect(user.getEmail()).toBe("jane@example.com");
  });

  it("should throw if user is not found", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([]), fakeHasher());

    await expect(useCase.execute({ userId: user.getId().getValue(), name: "Jane", actor: { id: user.getId().getValue(), role: 'CUSTOMER' } })).rejects.toThrow("User not found");
  });

  it("should throw if new password is weak", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([user]), fakeHasher());

    await expect(useCase.execute({ userId: user.getId().getValue(), password: "weak", actor: { id: user.getId().getValue(), role: 'CUSTOMER' } }))
      .rejects.toThrow("Password must be at least 8 characters");
  });

  it("should throw if new email is invalid", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([user]), fakeHasher());

    await expect(useCase.execute({ userId: user.getId().getValue(), email: "not-an-email", actor: { id: user.getId().getValue(), role: 'CUSTOMER' } }))
      .rejects.toThrow("Invalid email");
  });

  it("should throw Forbidden when actor is not the owner", async () => {
    const user = makeUser();
    const useCase = new UpdateUserUseCase(fakeUserRepository([user]), fakeHasher());

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        name: "Hacker",
        actor: { id: 'different-id', role: 'CUSTOMER' },
      })
    ).rejects.toThrow("Forbidden");
  });
});
