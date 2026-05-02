import { GetUserUseCase } from "@application/use-cases/user/get-user.use-case";
import { fakeUserRepository } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed_password" });

describe("GetUserUseCase", () => {
  it("should return user data when actor is the owner", async () => {
    const user = makeUser();
    const useCase = new GetUserUseCase(fakeUserRepository([user]));

    const output = await useCase.execute({
      userId: user.getId().getValue(),
      actor: { id: user.getId().getValue(), role: 'CUSTOMER' },
    });

    expect(output.id).toBe(user.getId().getValue());
    expect(output.name).toBe("John Doe");
    expect(output.email).toBe("john@example.com");
  });

  it("should allow ADMIN to access any user", async () => {
    const user = makeUser();
    const useCase = new GetUserUseCase(fakeUserRepository([user]));

    const output = await useCase.execute({
      userId: user.getId().getValue(),
      actor: { id: 'different-id', role: 'ADMIN' },
    });

    expect(output.id).toBe(user.getId().getValue());
  });

  it("should throw Forbidden when CUSTOMER accesses another user", async () => {
    const user = makeUser();
    const useCase = new GetUserUseCase(fakeUserRepository([user]));

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        actor: { id: 'different-id', role: 'CUSTOMER' },
      })
    ).rejects.toThrow("Forbidden");
  });

  it("should throw if user is not found", async () => {
    const useCase = new GetUserUseCase(fakeUserRepository());

    await expect(
      useCase.execute({
        userId: "00000000-0000-4000-8000-000000000001",
        actor: { id: "00000000-0000-4000-8000-000000000001", role: 'CUSTOMER' },
      })
    ).rejects.toThrow("User not found");
  });
});
