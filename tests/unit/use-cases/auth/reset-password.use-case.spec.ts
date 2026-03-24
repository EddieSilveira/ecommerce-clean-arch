import { ResetPasswordUseCase } from "@application/use-cases/auth/reset-password.use-case";
import { fakeUserRepository, fakeHasher } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const VALID_TOKEN = "valid-reset-token";

const makeUser = (tokenExpiresAt?: Date) => {
  const user = User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed:OldP@ss1" });
  const expiresAt = tokenExpiresAt ?? new Date(Date.now() + 1000 * 60 * 60); // 1h no futuro por padrão
  user.setResetToken(VALID_TOKEN, expiresAt);
  return user;
};

describe("ResetPasswordUseCase", () => {
  it("should update the user password when token is valid", async () => {
    const user = makeUser();
    const useCase = new ResetPasswordUseCase(fakeUserRepository([user]), fakeHasher());

    await useCase.execute({ token: VALID_TOKEN, newPassword: "NewP@ss123" });

    expect(user.getPasswordHash()).toBe("hashed:NewP@ss123");
  });

  it("should clear the reset token after a successful reset", async () => {
    const user = makeUser();
    const useCase = new ResetPasswordUseCase(fakeUserRepository([user]), fakeHasher());

    await useCase.execute({ token: VALID_TOKEN, newPassword: "NewP@ss123" });

    expect(user.getResetToken()).toBeUndefined();
    expect(user.getResetTokenExpiresAt()).toBeUndefined();
  });

  it("should throw 'Invalid or expired token' when token does not exist", async () => {
    const useCase = new ResetPasswordUseCase(fakeUserRepository([]), fakeHasher());

    await expect(
      useCase.execute({ token: "non-existent-token", newPassword: "NewP@ss123" })
    ).rejects.toThrow("Invalid or expired token");
  });

  it("should throw 'Invalid or expired token' when token is expired", async () => {
    const expiredAt = new Date(Date.now() - 1000); // 1 segundo no passado
    const user = makeUser(expiredAt);
    const useCase = new ResetPasswordUseCase(fakeUserRepository([user]), fakeHasher());

    await expect(
      useCase.execute({ token: VALID_TOKEN, newPassword: "NewP@ss123" })
    ).rejects.toThrow("Invalid or expired token");
  });

  it("should throw if new password is too weak", async () => {
    const user = makeUser();
    const useCase = new ResetPasswordUseCase(fakeUserRepository([user]), fakeHasher());

    await expect(
      useCase.execute({ token: VALID_TOKEN, newPassword: "weak" })
    ).rejects.toThrow("Password must be at least 8 characters");
  });

  it("should not change password if token is expired", async () => {
    const expiredAt = new Date(Date.now() - 1000);
    const user = makeUser(expiredAt);
    const originalHash = user.getPasswordHash();
    const useCase = new ResetPasswordUseCase(fakeUserRepository([user]), fakeHasher());

    await useCase.execute({ token: VALID_TOKEN, newPassword: "NewP@ss123" }).catch(() => {});

    expect(user.getPasswordHash()).toBe(originalHash);
  });
});
