import { DeleteUserUseCase } from "@application/use-cases/user/delete-user.use-case";
import { fakeUserRepository } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed:pass" });

describe("DeleteUserUseCase", () => {
  it("should delete an existing user", async () => {
    const user = makeUser();
    const users: User[] = [user];
    const useCase = new DeleteUserUseCase(fakeUserRepository(users));

    await useCase.execute({ userId: user.getId().getValue() });

    expect(users).toHaveLength(0);
  });

  it("should return success true", async () => {
    const user = makeUser();
    const useCase = new DeleteUserUseCase(fakeUserRepository([user]));

    const output = await useCase.execute({ userId: user.getId().getValue() });

    expect(output.success).toBe(true);
  });

  it("should throw if user is not found", async () => {
    const user = makeUser();
    const useCase = new DeleteUserUseCase(fakeUserRepository([]));

    await expect(useCase.execute({ userId: user.getId().getValue() })).rejects.toThrow("User not found");
  });
});
