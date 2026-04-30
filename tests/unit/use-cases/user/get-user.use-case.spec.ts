import { GetUserUseCase } from "@application/use-cases/user/get-user.use-case";
import { fakeUserRepository } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed_password" });

describe("GetUserUseCase", () => {
  it("should return user data by id", async () => {
    const user = makeUser();
    const useCase = new GetUserUseCase(fakeUserRepository([user]));

    const output = await useCase.execute({ userId: user.getId().getValue() });

    expect(output.id).toBe(user.getId().getValue());
    expect(output.name).toBe("John Doe");
    expect(output.email).toBe("john@example.com");
  });

  it("should throw if user is not found", async () => {
    const useCase = new GetUserUseCase(fakeUserRepository());

    await expect(
      useCase.execute({ userId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("User not found");
  });
});
