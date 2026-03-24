import { IEmailNotifier } from "@application/ports/email-notifier";
import { ITokenGenerator } from "@application/ports/token-generator";
import { IUserRepository } from "@application/ports/user.repository";

export interface ForgotPasswordInput {
  email: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly emailNotifier: IEmailNotifier
  ) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) return;

    const token = this.tokenGenerator.generate();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    user.setResetToken(token, expiresAt);
    await this.userRepository.save(user);

    await this.emailNotifier.sendPasswordReset(user.getEmail(), token);
  }
}
