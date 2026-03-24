import { IHasher } from "@application/ports/hasher";
import { IUserRepository } from "@application/ports/user.repository";
import { Password } from "@domain/shared/value-objects/password.vo";

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const user = await this.userRepository.findByResetToken(input.token);
    if (!user) throw new Error("Invalid or expired token");

    const expiresAt = user.getResetTokenExpiresAt();
    if (!expiresAt || expiresAt < new Date()) throw new Error("Invalid or expired token");

    const password = Password.create(input.newPassword);
    const passwordHash = await this.hasher.hash(password.getValue());

    user.update({ passwordHash });
    user.clearResetToken();
    await this.userRepository.save(user);
  }
}
