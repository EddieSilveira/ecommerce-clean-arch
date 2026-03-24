import { IHasher } from "@application/ports/hasher";
import { ITokenProvider } from "@application/ports/token-provider";
import { IUserRepository } from "@application/ports/user.repository";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInOutput {
  token: string;
}

export class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher,
    private readonly tokenProvider: ITokenProvider
  ) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await this.hasher.compare(input.password, user.getPasswordHash());
    if (!valid) throw new Error("Invalid credentials");

    const token = this.tokenProvider.generate(user.getId().getValue());
    return { token };
  }
}
