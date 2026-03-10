import { CreateUserUseCase } from "@application/use-cases/user/create-user.use-case";
import { fakeUserRepository, fakeHasher } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const validInput = () => ({ name: "John Doe", email: "john@example.com", password: "StrongP@ss1" });

describe("CreateUserUseCase", () => {
  it("should create a user and return the userId", async () => {
    const useCase = new CreateUserUseCase(fakeUserRepository(), fakeHasher());

    const output = await useCase.execute(validInput());

    expect(output.userId).toBeDefined();
  });

  it("should save user with hashed password", async () => {
    const users: User[] = [];
    const useCase = new CreateUserUseCase(fakeUserRepository(users), fakeHasher());

    await useCase.execute(validInput());

    expect(users).toHaveLength(1);
    expect(users[0]!.getPasswordHash()).toBe("hashed:StrongP@ss1");
  });

  it("should throw if email is already in use", async () => {
    const useCase = new CreateUserUseCase(fakeUserRepository(), fakeHasher());

    await useCase.execute(validInput());

    await expect(useCase.execute(validInput())).rejects.toThrow("Email already in use");
  });

  it("should throw if email is invalid", async () => {
    const useCase = new CreateUserUseCase(fakeUserRepository(), fakeHasher());

    await expect(useCase.execute({ ...validInput(), email: "not-an-email" })).rejects.toThrow("Invalid email");
  });

  it("should throw if name is empty", async () => {
    const useCase = new CreateUserUseCase(fakeUserRepository(), fakeHasher());

    await expect(useCase.execute({ ...validInput(), name: "" })).rejects.toThrow("User name cannot be empty");
  });
});
