import { DeleteUserUseCase } from "@application/use-cases/user/delete-user.use-case";
import { fakeUserRepository } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed:pass" });

describe("DeleteUserUseCase", () => {
  it("should delete an existing user", async () => {
    const user = makeUser();
    const users: User[] = [user];
    const useCase = new DeleteUserUseCase(fakeUserRepository(users));

    await useCase.execute({ userId: user.getId().getValue(), actor: { id: user.getId().getValue(), role: 'CUSTOMER' } });

    expect(users).toHaveLength(0);
  });

  it("should return success true", async () => {
    const user = makeUser();
    const useCase = new DeleteUserUseCase(fakeUserRepository([user]));

    const output = await useCase.execute({ userId: user.getId().getValue(), actor: { id: user.getId().getValue(), role: 'CUSTOMER' } });

    expect(output.success).toBe(true);
  });

  it("should throw if user is not found", async () => {
    const user = makeUser();
    const useCase = new DeleteUserUseCase(fakeUserRepository([]));

    await expect(useCase.execute({ userId: user.getId().getValue(), actor: { id: user.getId().getValue(), role: 'CUSTOMER' } })).rejects.toThrow("User not found");
  });

  it("should allow ADMIN to delete any user", async () => {
    const user = makeUser();
    const users = [user];
    const useCase = new DeleteUserUseCase(fakeUserRepository(users));

    await useCase.execute({
      userId: user.getId().getValue(),
      actor: { id: 'admin-id', role: 'ADMIN' },
    });

    expect(users).toHaveLength(0);
  });

  it("should throw Forbidden when CUSTOMER tries to delete another user", async () => {
    const user = makeUser();
    const useCase = new DeleteUserUseCase(fakeUserRepository([user]));

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        actor: { id: 'different-id', role: 'CUSTOMER' },
      })
    ).rejects.toThrow("Forbidden");
  });
});
