import { ForgotPasswordUseCase } from "@application/use-cases/auth/forgot-password.use-case";
import { fakeUserRepository, fakeTokenGenerator, fakeEmailNotifier } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () =>
  User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed:pass" });

describe("ForgotPasswordUseCase", () => {
  it("should send a password reset email when user exists", async () => {
    const user = makeUser();
    const emailNotifier = fakeEmailNotifier();
    const useCase = new ForgotPasswordUseCase(fakeUserRepository([user]), fakeTokenGenerator(), emailNotifier);

    await useCase.execute({ email: "john@example.com" });

    expect(emailNotifier.sentEmails).toHaveLength(1);
    expect(emailNotifier.sentEmails[0]!.email).toBe("john@example.com");
  });

  it("should set a reset token on the user", async () => {
    const user = makeUser();
    const useCase = new ForgotPasswordUseCase(fakeUserRepository([user]), fakeTokenGenerator(), fakeEmailNotifier());

    await useCase.execute({ email: "john@example.com" });

    expect(user.getResetToken()).toBe("reset-token-abc123");
  });

  it("should set a reset token expiration date", async () => {
    const user = makeUser();
    const before = new Date();
    const useCase = new ForgotPasswordUseCase(fakeUserRepository([user]), fakeTokenGenerator(), fakeEmailNotifier());

    await useCase.execute({ email: "john@example.com" });

    const expiresAt = user.getResetTokenExpiresAt();
    expect(expiresAt).toBeDefined();
    expect(expiresAt!.getTime()).toBeGreaterThan(before.getTime());
  });

  it("should include the generated token in the email", async () => {
    const user = makeUser();
    const emailNotifier = fakeEmailNotifier();
    const useCase = new ForgotPasswordUseCase(fakeUserRepository([user]), fakeTokenGenerator(), emailNotifier);

    await useCase.execute({ email: "john@example.com" });

    expect(emailNotifier.sentEmails[0]!.token).toBe("reset-token-abc123");
  });

  it("should do nothing when email is not registered (silent fail)", async () => {
    const emailNotifier = fakeEmailNotifier();
    const useCase = new ForgotPasswordUseCase(fakeUserRepository([]), fakeTokenGenerator(), emailNotifier);

    await expect(useCase.execute({ email: "nobody@example.com" })).resolves.not.toThrow();
    expect(emailNotifier.sentEmails).toHaveLength(0);
  });
});
