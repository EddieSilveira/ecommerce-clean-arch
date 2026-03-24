import { SignInUseCase } from "@application/use-cases/auth/sign-in.use-case";
import { fakeUserRepository, fakeHasher, fakeTokenProvider } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () =>
  User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed:StrongP@ss1" });

describe("SignInUseCase", () => {
  it("should return a token when credentials are valid", async () => {
    const user = makeUser();
    const useCase = new SignInUseCase(fakeUserRepository([user]), fakeHasher(), fakeTokenProvider());

    const output = await useCase.execute({ email: "john@example.com", password: "StrongP@ss1" });

    expect(output.token).toBe(`token:${user.getId().getValue()}`);
  });

  it("should throw 'Invalid credentials' when email is not found", async () => {
    const useCase = new SignInUseCase(fakeUserRepository([]), fakeHasher(), fakeTokenProvider());

    await expect(
      useCase.execute({ email: "unknown@example.com", password: "StrongP@ss1" })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw 'Invalid credentials' when password is wrong", async () => {
    const user = makeUser();
    const useCase = new SignInUseCase(fakeUserRepository([user]), fakeHasher(), fakeTokenProvider());

    await expect(
      useCase.execute({ email: "john@example.com", password: "WrongPassword1" })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should use the same error message for wrong email and wrong password (no user enumeration)", async () => {
    const user = makeUser();
    const userRepo = fakeUserRepository([user]);
    const useCase = new SignInUseCase(userRepo, fakeHasher(), fakeTokenProvider());

    const errorWhenEmailNotFound = await useCase
      .execute({ email: "nobody@example.com", password: "StrongP@ss1" })
      .catch(e => (e as Error).message);

    const errorWhenPasswordWrong = await useCase
      .execute({ email: "john@example.com", password: "WrongPassword1" })
      .catch(e => (e as Error).message);

    expect(errorWhenEmailNotFound).toBe(errorWhenPasswordWrong);
  });
});
